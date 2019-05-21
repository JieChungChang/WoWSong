module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('comment', 
  {
    post_id: DataTypes.BIGINT(60),
    member_account: DataTypes.STRING(60),
    comment: DataTypes.STRING,
    time: DataTypes.BIGINT(60)
  }, 
  {
    paranoid: true,
    underscored: true
  });
  return Comment;
};