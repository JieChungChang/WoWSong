module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('comment', 
  {
    post_id: DataTypes.BIGINT(20),
    member_account: DataTypes.STRING(60),
    comment: DataTypes.STRING,
    time: DataTypes.BIGINT(20)
  }, 
  {
    paranoid: true,
    underscored: true
  });
  return Comment;
};