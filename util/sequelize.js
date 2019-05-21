const Sequelize = require('sequelize');
const password = require('../util/.key/keys.js').mysql.password;

const sequelize = new Sequelize('obeobeko', 'root', password, {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 8,
        min: 0,
        // acquire: 40000,
        idle: 30000
    },
    define: {
        underscored: true,
        freezeTableName: true,
        timestamps: false
    }
});

sequelize.authenticate()
.then(()=>{
    console.log('Sequelize Seccuss');
})
.catch((err)=>{
    console.log('Sequelize Fail');
});

// Connect all the models/tables in the database to a db object,
// so everything is accessible via one object
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models/tables
db.members     = require('./models/members.js')(sequelize, Sequelize);
db.posts       = require('./models/posts.js')(sequelize, Sequelize);
db.comments    = require('./models/comments.js')(sequelize, Sequelize);
db.memberLikes = require('./models/memberLikes.js')(sequelize, Sequelize);
db.follows     = require('./models/follows.js')(sequelize, Sequelize);
db.followers   = require('./models/followers.js')(sequelize, Sequelize);

// Relations
db.members.hasMany(db.posts, {foreignKey: 'member_account', sourceKey: 'account'});
db.members.hasMany(db.memberLikes, {foreignKey: 'member_account', sourceKey: 'account'});
db.members.hasMany(db.follows, {foreignKey: 'account', sourceKey: 'account'});

db.memberLikes.hasOne(db.posts, {foreignKey: 'id', sourceKey: 'post_id'});

db.posts.hasMany(db.comments, {foreignKey: 'post_id', sourceKey: 'id'});
db.posts.hasMany(db.memberLikes, {foreignKey: 'post_id', sourceKey: 'id'});

db.posts.belongsTo(db.members, {foreignKey: 'member_account', targetKey: 'account'});

module.exports = db;
