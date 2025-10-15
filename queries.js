// queries.js - Demonstrates CRUD, advanced queries, and indexing in MongoDB

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017'; // or your Atlas URI
const dbName = 'plp_bookstore';
const collectionName = 'books';

async function runQueries() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log(" Connected to MongoDB");

    const db = client.db(dbName);
    const books = db.collection(collectionName);

    // --- Basic READ Queries ---
    console.log("\n All Fiction Books:");
    console.log(await books.find({ genre: "Fiction" }).toArray());

    console.log("\n Books published after 1950:");
    console.log(await books.find({ published_year: { $gt: 1950 } }).toArray());

    console.log("\n Books by George Orwell:");
    console.log(await books.find({ author: "George Orwell" }).toArray());

    // --- UPDATE Example ---
    const updateResult = await books.updateOne(
      { title: "1984" },
      { $set: { price: 13.99 } }
    );
    console.log(`\n💲 Updated '1984': ${updateResult.modifiedCount} document(s) updated.`);

    // --- DELETE Example ---
    const deleteResult = await books.deleteOne({ title: "Moby Dick" });
    console.log(`\n Deleted 'Moby Dick': ${deleteResult.deletedCount} document(s) removed.`);

    // --- Aggregation: Average Price by Genre ---
    console.log("\n Average price per genre:");
    const avgByGenre = await books.aggregate([
      { $group: { _id: "$genre", avgPrice: { $avg: "$price" } } },
      { $sort: { avgPrice: -1 } }
    ]).toArray();
    console.log(avgByGenre);

    // --- Aggregation: Author with Most Books ---
    console.log("\n Author with the most books:");
    const mostBooks = await books.aggregate([
      { $group: { _id: "$author", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).toArray();
    console.log(mostBooks);

    // --- Aggregation: Books per Decade ---
    console.log("\n Books grouped by decade:");
    const byDecade = await books.aggregate([
      { $project: { decade: { $multiply: [ { $floor: { $divide: ["$published_year", 10] } }, 10 ] } } },
      { $group: { _id: "$decade", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    console.log(byDecade);

    // --- Indexing ---
    console.log("\n Creating indexes...");
    await books.createIndex({ title: 1 });
    await books.createIndex({ author: 1, published_year: -1 });

    console.log("\n Current indexes:");
    const indexes = await books.listIndexes().toArray();
    console.log(indexes);

  } catch (err) {
    console.error(" Error:", err);
  } finally {
    await client.close();
    console.log("\n Connection closed");
  }
}

runQueries();
