import { MongoClient } from 'mongodb';
import { MongoDBAtlasVectorSearch } from 'langchain/vectorstores/mongodb_atlas';
import { embeddings } from './langchain.service';
import { ReportType } from '../../models/ReportType';
import { Document } from '@langchain/core/dist/documents/document';

const username = encodeURIComponent(process.env.MONGODB_USE_NAME as string);
const password = encodeURIComponent(process.env.MONGODB_PASSWORD as string);

const uri = `mongodb+srv://${username}:${password}@vectordatabase.xptaak5.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

const dbName = 'financialNarratives';
const reportsCollection = client.db(dbName).collection('reports');
const reportMetadataCollection = client.db(dbName).collection('reportMetadata');

let vectorSearch: MongoDBAtlasVectorSearch;

const initializeVectorSearchInstance = async () => {
    if (!vectorSearch) {
        await client.connect();
        // await reportsCollection.deleteMany({});
        // await reportMetadataCollection.deleteMany({});

        const firstDocument: Document = {
            pageContent: 'This is financial reports',
            metadata: {
                ticker: '',
                reportType: ReportType.ANNUAL,
                created: new Date(),
            },
        };

        console.log('firstDocument', firstDocument);

        vectorSearch = await MongoDBAtlasVectorSearch.fromDocuments([firstDocument], embeddings, {
            collection: reportsCollection,
            indexName: 'vector_index',
            textKey: 'text',
            embeddingKey: 'embedding',
        });

        console.log('vectorSearch', vectorSearch);
    }
    return vectorSearch;
};

export const insertNarrativesIntoDatabase = async (narrativesWithMetadata: Document[], channelName: string) => {
    const vectorSearchInstance = await initializeVectorSearchInstance();
    await vectorSearchInstance.addDocuments(narrativesWithMetadata);

    const reportMetadata = {
        ticker: channelName, //company ticker
        reportType: ReportType.ANNUAL,
        created: new Date(),
    };
    await reportMetadataCollection.insertOne(reportMetadata);
};

export const performSimilaritySearch = async (question: string, ticker: string): Promise<any> => {
    try {
        const vectorSearchInstance = await initializeVectorSearchInstance();
        const searchResults = await vectorSearchInstance.similaritySearch(question, 10, {
            preFilter: {
                ticker,
            },
        });

        console.log('Similarity search results:', searchResults);
        return searchResults;
    } catch (error) {
        console.error('Error performing similarity search:', error);
        throw error;
    }
};

export const getAllReportMetadata = async (): Promise<any[]> => {
    try {
        await client.connect();
        const metadata = await reportMetadataCollection.find({}).toArray();
        console.log('Retrieved all report metadata:', metadata);
        return metadata;
    } catch (error) {
        console.error('Error retrieving all report metadata:', error);
        throw error;
    } finally {
        await client.close();
    }
};
