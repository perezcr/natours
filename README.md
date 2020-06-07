## MongoDB
MongoDB is a document database with the scalability and flexibility that you want with the querying and indexing that you need.
<p align="center">
  <img src="notes-imgs/1.png" alt="MongoDB">
</p>

### Key MongoDB Features
* **Document based**: MongoDB stores data in documents(rows), which are field-value paired data structures like JSON (field-value pair data structures, NoSQL).
* **Scalable**: Very easy to distribute data across multiple machine as your users and amount of data grows.
* **Flexible**: No document data schema required, so each document can have different number and type of fields.
* **Performant**: Embedded data models, indexing, sharding, flexible documents, native duplication, etc.

### Document Structure
MongoDB uses a data format similar to JSON for data storage called BSON.
<p align="center">
  <img src="notes-imgs/2.png" alt="document-structure">
</p>

#### BSON
Data format MongoDB uses for data storage. Like JSON, but **typed**. So MongoDB documents are typed.

Note: The maximum size for each document is currently 16MB.

#### Embedding/Denormalizing
Including related data into a single document. This allows for quicker access and easier data models (it's not always the best solution).

### MongoDB Commands

```shell
# Create or switch Database
$ use <db-name>

# List Databases
$ show dbs

# List collections in DB
$ show collections

# CREATE
# Insert data in collection
$ db.<collection-name>.insertOne({ Object })
$ db.<collection-name>.insertMany([{ Object }, { Object }, …])

# READ
# Queryng all documents in collection
$ db.<collection-name>.find()

# Queryng document with condition
$ db.<collection-name>.find({ attr: 'x' })

# MongoDB operators begin with $
# $lte: less than or equal <=
# $gte: greater than or equal >=
# $lt: less than <
# $gt: greater than >
$ db.<collection-name>.find({ price: {$lte: 500} })

# Search for two search criteria at the same time
# AND
$ db.<collection-name>.find({ price: {$lt: 500}, rating: {$gte: 4.8} })
# OR
$ db.<collection-name>.find({ $or: [ {price: {$lt: 500}}, {rating: {$gte: 4.8}} ] })

# Select in results, just the name property to be in the output
$ db.<collection-name>.find({ $or: [ {price: {$lt: 500}}, {rating: {$gte: 4.8}} ] }, {name: 1})

# UPDATE
# Update parts of the document
$ db.<collection-name>.updateOne({ name: “The Snow Adventure” }, { $set: {price: 597} })
$ db.<collection-name>.updateMany({ price: {$gt: 500}, rating: {$gte: 4.8} }, { $set: {premium: true} })

# Completely replace content of document
$ db.<collection-name>.replaceOne({ ... })
$ db.<collection-name>.replaceMany({ ... })

# DELETE
$ db.<collection-name>.deleteOne({ ... })
$ db.<collection-name>.deleteMany({ rating: {$lt: 4.8} })
# Delete all documents
$ db.<collection-name>.deleteMany({})

# Exit from Mongo Shell
$ quit()
```
