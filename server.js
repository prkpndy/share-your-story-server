const { createWriteStream, unlink } = require("fs");
const { ApolloServer } = require("apollo-server-koa");
const { graphqlUploadKoa } = require("graphql-upload");
const Koa = require("koa");
const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const mkdirp = require("mkdirp");
const shortid = require("shortid");
const typeDefs = require("./schema/schema");
const resolvers = require("./resolvers/resolver");

const dotenv = require('dotenv');
dotenv.config();

const UPLOAD_DIR = "./uploads";
const db = lowdb(new FileSync("db.json"));

db.defaults({ uploads: [] }).write();

mkdirp.sync(UPLOAD_DIR);

/**
 * Stores a GraphQL file upload. The file is stored in the filesystem and its
 * metadata is recorded in the DB.
 * @param {Promise<object>} upload GraphQL file upload.
 * @returns {Promise<object>} File metadata.
 */
async function storeUpload(upload) {
    const { createReadStream, filename, mimetype } = await upload;
    console.log(createReadStream);
    const stream = createReadStream();
    const id = shortid.generate();
    const path = `${UPLOAD_DIR}/${id}-${filename}`;
    const file = { id, filename, mimetype, path };

    await new Promise((resolve, reject) => {
        const writeStream = createWriteStream(path);

        writeStream.on("finish", resolve);

        writeStream.on("error", (error) => {
            unlink(path, () => {
                reject(error);
            });
        });

        stream.on("error", (error) => writeStream.destroy(error));

        stream.pipe(writeStream);
    });

    db.get("uploads").push(file).write();

    return file;
}

const app = new Koa().use(
    graphqlUploadKoa({
        maxFileSize: 10000000,
        maxFiles: 20,
    })
);

new ApolloServer({
    uploads: false,
    typeDefs,
    resolvers,
    context: { db, storeUpload },
}).applyMiddleware({ app });

app.listen(process.env.PORT, (error) => {
    if (error) throw error;
    console.info(
        `Serving http://localhost:${process.env.PORT} for ${process.env.NODE_ENV}.`
    );
});
