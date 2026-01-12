
const {
    DB_URL
} = process.env;



const { MongoClient } = require("mongodb");

let conn = new MongoClient(DB_URL, { useUnifiedTopology: true });

module.exports = {
    /**
     * Đối tượng cơ sở dữ liệu Singleton kết nối đến cơ sở dữ liệu mongodb
     */
    async getDbo() {
        if (!conn.isConnected())
            await conn.connect();
        return conn.db();
    }
}
