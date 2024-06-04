import { promises as fs } from 'fs';
import path from 'path';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { LLMChain } from 'langchain/chains';
import { RunnableSequence } from 'langchain/schema/runnable';
import { PromptTemplate } from 'langchain/prompts';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { Document } from 'langchain/document';
import { formatDocumentsAsString } from 'langchain/util/document';
import { performSimilaritySearch } from './mongodb.service';
import { ReportType } from '../../models/ReportType';
import { Message } from '../../models/Message';
import { MessageSender } from '../../models/MessageSender';
import { channels } from '../../channels/resolvers';

console.log('process.env.OPENAI_API_KEY', process.env.OPENAI_API_KEY);

const openAIApiKey: string = process.env.OPENAI_API_KEY as string;

const questionPrompt: PromptTemplate = PromptTemplate.fromTemplate(
    `Use the following pieces of context and your knowledge to answer the question at the end.
    ----------
    CONTEXT: {context}
    ----------
    QUESTION: {question}
    ----------
    CHANNEL: {channelName}
    ----------
    CHAT HISTORY: {chatHistory}
    ----------
    Helpful Answer:`,
);

const questionGeneratorTemplate: PromptTemplate = PromptTemplate.fromTemplate(
    `Given the following conversation and a follow up question or message, rephrase the follow up question or message to be a standalone question. 
    ----------
    FOLLOWUP QUESTION: {chatHistory}
    ----------
    CHANNEL: {channelName}
    ----------
    CHAT HISTORY: {question}
    ----------
    Standalone question:`,
);

const structuredDataPromptToNarrativeTemplate: PromptTemplate = PromptTemplate.fromTemplate(
    `Given the following financial report data for a company'.
    ----------
    STRUCTURED DATA PROMPT: {prompt}
    ----------
    INTERPRETED RESPONSE:`,
);

const fasterModel: ChatOpenAI = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    openAIApiKey: openAIApiKey,
});

const questionGeneratorChain = new LLMChain({
    llm: fasterModel,
    prompt: questionGeneratorTemplate,
});

const structuredDataPromptToNarrativeChain = new LLMChain({
    llm: fasterModel,
    prompt: structuredDataPromptToNarrativeTemplate,
});

const slowerModel: ChatOpenAI = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo-16k', // Replace with 'gpt-4' if possible
    openAIApiKey: openAIApiKey,
});

const slowerChain = new LLMChain({
    llm: slowerModel,
    prompt: questionPrompt,
});

export const embeddings: OpenAIEmbeddings = new OpenAIEmbeddings({
    openAIApiKey: openAIApiKey,
    modelName: 'text-embedding-3-large',
    dimensions: 1000,
});

export const transformStructuredDataToNarrative = async (channelName: string) => {
    const basePath = path.join(__dirname, '../../../dummyData', channelName);
    const fileNames = ['balance_sheet', 'income_statement', 'cash_flow', 'earnings', 'overview'];
    let narrativeText = '';
    let promises: any = [];

    for (const fileName of fileNames) {
        const filePath = path.join(basePath, `${fileName}.json`);
        try {
            const fileContent = await fs.readFile(filePath, 'utf8');
            const jsonData = JSON.parse(fileContent);
            let reports: any

            if (fileName === 'overview') {
                reports = [jsonData];
            } else if (fileName === 'earnings') {
                reports = jsonData.annualEarnings;
            } else {
                reports = jsonData.annualReports;
            }

            reports.forEach((report: any) => {
                const prompt = generatePromptForTemplate(report, ReportType.ANNUAL);
                promises.push(
                    structuredDataPromptToNarrativeChain
                        .invoke({ prompt })
                        .then(
                            ({ text }) =>
                                `\n\nCompany Ticker: ${channelName} \n\nReport Type: ${fileName}\n${text}\n\n`,
                        ),
                );
            });
        } catch (error) {
            console.error(`Error in transformStructuredDataToNarrative for ${fileName}:`, error);
        }
    }

    const results = await Promise.all(promises);
    narrativeText = results.join('');

    const collectedTextFile = path.join(basePath, 'collectedText.txt');
    await fs.writeFile(collectedTextFile, narrativeText);

    const splitter = new CharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    const documents = await splitter.createDocuments([narrativeText]);

    const documentsWithMetadata = documents.map((doc) => ({
        ...doc,
        metadata: {
            ...doc.metadata,
            ticker: channelName, //company ticker
            reportType: ReportType.ANNUAL,
        },
    }));

    return documentsWithMetadata;
};

const generatePromptForTemplate = (report: any, reportType: ReportType): string => {
    let reportDataString = `${reportType} Report Data:\n`;
    Object.keys(report).forEach((key) => {
        if (report[key] && report[key] !== 'None' && key !== 'reportedCurrency' && key !== 'symbol') {
            let value = report[key];
            if (!isNaN(Number(value))) {
                value = `$${(parseInt(value) / 1000000).toFixed(2)} million`;
            }
            reportDataString += `- ${key}: ${value}\n`;
        }
    });

    return `Given the following ${reportType} financial report data for a company:\n\n${reportDataString}\nCreate a narrative summary template for each type of report that highlights key financial figures and trends. `;
};

export const serializeChatHistory = (chatHistory: Array<Message>): string => {
    return chatHistory
        .map((chatMessage) => {
            if (chatMessage.sender === MessageSender.USER) {
                return `Human: ${chatMessage.content}`;
            } else if (chatMessage.sender === MessageSender.GPT) {
                return `Assistant: ${chatMessage.content}`;
            } else {
                return `${chatMessage.content}`;
            }
        })
        .join('\n');
};

const performQuestionAnswering = async (input: {
    channelName: string;
    question: string;
    chatHistory: Array<Message> | null;
}): Promise<{ result: string; rephrasedQuestion: string; sourceDocuments: Array<Document> } | undefined> => {
    let newQuestion = input.question;
    const chatHistoryString = input.chatHistory ? serializeChatHistory(input.chatHistory) : null;

    try {
        const context = await performSimilaritySearch(input.question, input.channelName);
        const serializedDocs = formatDocumentsAsString(context);

        if (chatHistoryString) {
            const { text } = await questionGeneratorChain.invoke({
                chatHistory: chatHistoryString,
                context: serializedDocs,
                question: input.question,
                channelName: input.channelName,
            });

            newQuestion = text;
        }

        const response = await slowerChain.invoke({
            chatHistory: chatHistoryString ?? '',
            context: serializedDocs,
            question: newQuestion,
            channelName: input.channelName,
        });

        return {
            result: response.text,
            rephrasedQuestion: newQuestion,
            sourceDocuments: context,
        };
    } catch (error) {
        console.error('Error in performQuestionAnswering:', error);
        return undefined;
    }
};

export const createConversationalChain = () => {
    const chain = RunnableSequence.from([
        {
            question: (input: { question: string; channelName: string }) => input.question,
            chatHistory: (input: { question: string; channelName: string }) => {
                return channels.find(channel => channel.name === input.channelName)?.messages;
            },
            channelName: (input: { question: string; channelName: string }) => input.channelName,
        },
        performQuestionAnswering,
    ] as any);

    return chain;
};
