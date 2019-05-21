module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('post', 
  {
    member_account: DataTypes.STRING(60),
    video_id: DataTypes.STRING(60),
    title: DataTypes.STRING,
    picture: DataTypes.STRING,
    content: DataTypes.STRING, 
    time: DataTypes.BIGINT(20),
    view_times: DataTypes.BIGINT(20)
  }, 
  {
    paranoid: true,
    underscored: true
  });
  return Post;
};