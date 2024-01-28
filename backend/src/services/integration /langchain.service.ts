import { promises as fs } from 'fs';
import path from 'path';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { LLMChain } from 'langchain/chains';
import { RunnableSequence } from 'langchain/schema/runnable';
import { BufferMemory } from 'langchain/memory';
import { BaseMessage } from 'langchain/schema';
import { PromptTemplate } from 'langchain/prompts';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { Document } from 'langchain/document';
import { formatDocumentsAsString } from 'langchain/util/document';

const openAIApiKey: string = process.env.OPENAI_API_KEY as string;

const memory: BufferMemory = new BufferMemory({
    memoryKey: 'chatHistory',
    inputKey: 'question',
    outputKey: 'text',
    returnMessages: true,
});

const questionPrompt: PromptTemplate = PromptTemplate.fromTemplate(
    `Use the following pieces of context and your knowledge to answer the question at the end.
    ----------
    CONTEXT: {context}
    ----------
    CHAT HISTORY: {chatHistory}
    ----------
    CHANNEL: {channelName}
    ----------
    QUESTION: {question}
    ----------
    Helpful Answer:`,
);

const questionGeneratorTemplate: PromptTemplate = PromptTemplate.fromTemplate(
    `Given the following conversation and a follow up question or message, rephrase the follow up question or message to be a standalone question. 
    ----------
    CHAT HISTORY: {chatHistory}
    ----------
    CHANNEL: {channelName}
    ----------
    FOLLOWUP QUESTION: {question}
    ----------
    Standalone question:`,
);

const interpretQuestionTemplate: PromptTemplate = PromptTemplate.fromTemplate(
    `Given the question, identify the key attributes that correspond to JSON files (like 'balance_sheet', 'income_statement', 'cash_flow', 'earnings', 'overview') and identify the year mentioned. Identify the fiscal ending date for that year and list them as "YYYY-MM-DD". Return the results in a structured JSON format with arrays for 'fileNames' and 'dates'.
    ----------
    CHAT HISTORY: {chatHistory}
    ----------
    CHANNEL: {channelName}
    ----------
    QUESTION: {question}
    ----------
    INTERPRETED RESPONSE:`,
);

const fasterModel: ChatOpenAI = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    openAIApiKey: openAIApiKey,
});

const questionGeneratorChain: LLMChain = new LLMChain({
    llm: fasterModel,
    prompt: questionGeneratorTemplate,
});

const interpretQuestionChain: LLMChain = new LLMChain({
    llm: fasterModel,
    prompt: interpretQuestionTemplate,
});

const slowerModel: ChatOpenAI = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo-16k', // Replace with 'gpt-4' if possible
    openAIApiKey: openAIApiKey,
});

const slowerChain: LLMChain = new LLMChain({
    llm: slowerModel,
    prompt: questionPrompt,
});

const embeddings: OpenAIEmbeddings = new OpenAIEmbeddings({
    openAIApiKey: openAIApiKey,
    modelName: 'text-embedding-3-large',
});

export const stringToRetriever = async (str: string) => {
    const splitter = new CharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    const documents = await splitter.createDocuments([str]);
    const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);
    return vectorStore.asRetriever();
};

export const serializeChatHistory = (chatHistory: Array<BaseMessage>): string => {
    return chatHistory
        .map((chatMessage) => {
            if (chatMessage._getType() === 'human') {
                return `Human: ${chatMessage.content}`;
            } else if (chatMessage._getType() === 'ai') {
                return `Assistant: ${chatMessage.content}`;
            } else {
                return `${chatMessage.content}`;
            }
        })
        .join('\n');
};

const performQuestionAnswering = async (
    input: {
        channelName: string;
        question: string;
        chatHistory: Array<BaseMessage> | null;
    },
): Promise<{ result: string; rephrasedQuestion: string; sourceDocuments: Array<Document> } | undefined> => {
    let newQuestion = input.question;
    const chatHistoryString = input.chatHistory ? serializeChatHistory(input.chatHistory) : null;

    try {
        const validFileNames = ['balance_sheet', 'income_statement', 'cash_flow', 'earnings', 'overview'];

        const interpretationChainValues = await interpretQuestionChain.invoke({
            chatHistory: chatHistoryString,
            question: input.question,
            channelName: input.channelName,
        });

        let { fileNames, dates } = JSON.parse(interpretationChainValues.text);

        if (!Array.isArray(fileNames) || !Array.isArray(dates)) {
            throw new Error('Error in performQuestionAnswering: Invalid interpretation format');
        }
        fileNames = fileNames.filter((fileName) => validFileNames.includes(fileName));

        const data = await fetchDataFromFiles(input.channelName, fileNames, dates);
        const dataString = JSON.stringify(data);
        const retriever = await stringToRetriever(dataString);
        const context = await retriever.getRelevantDocuments(input.question);

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

        await memory.saveContext(
            {
                question: input.question,
            },
            {
                text: response.text,
            },
        );

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

const fetchDataFromFiles = async (channelName: string, fileNames: string[], dates: string[]) => {
    const basePath = path.join(__dirname, '../../../dummyData', channelName);
    let data: any = {};

    for (const fileName of fileNames) {
        const filePath = path.join(basePath, `${fileName}.json`);
        try {
            const fileContent = await fs.readFile(filePath, 'utf8');
            const jsonData = JSON.parse(fileContent);

            if (fileName === 'overview') {
                data[fileName] = jsonData;
            } else {
                data[fileName] = {
                    annualReports: jsonData.annualReports?.filter((report: any) =>
                        dates.includes(report.fiscalDateEnding),
                    ),
                    quarterlyReports: jsonData.quarterlyReports?.filter((report: any) =>
                        dates.includes(report.fiscalDateEnding),
                    ),
                };
            }
        } catch (error) {
            console.error(`Error in fetchDataFromFiles reading file ${fileName}:`, error);
        }
    }

    return data;
};

export const createConversationalChain = () => {
    const chain = RunnableSequence.from([
        {
            question: (input: { question: string; channelName: string }) => input.question,
            chatHistory: async () => {
                const savedMemory = await memory.loadMemoryVariables({});
                const hasHistory = savedMemory.chatHistory.length > 0;
                return hasHistory ? savedMemory.chatHistory : null;
            },
            channelName: (input: { question: string; channelName: string }) => input.channelName,
        },
        performQuestionAnswering,
    ] as any);

    return chain;
};
