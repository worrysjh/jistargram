const pool = require("../../models/db");

async function pressLikeService(user_id, target_type, target_id) {
    try{
        await pool.query("INSERT INTO likes (user_id, target_type, target_id) VALUES ($1, $2, $3)", [user_id, target_type, target_id]);
        return {success: true};
    } catch(err) {
        throw err;
    }
}

module.exports = {pressLikeService};