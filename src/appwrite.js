const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
import {Client, Databases, ID, Query} from 'appwrite';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearcCount = async (searchTerm, movie) => {
//     check weather the searchTeem is already exist or not in the appwrite database
    try{
        const response = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm)
        ]);
        if(response.documents.length > 0) {
            const document = response.documents[0];
//     if it does, update the count

            await database.updateDocument(DATABASE_ID, COLLECTION_ID, document.$id, {
                $set: {
                    count: document.count + 1
                }
            })
//     if it doesn't, create a new document with the searchTerm and count
        } else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            })
        }
    } catch (error) {
        console.log(error);
    }
}