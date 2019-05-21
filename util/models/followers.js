module.exports = (sequelize, DataTypes) => {
  const Follower = sequelize.define('follow', 
  {
    account: DataTypes.BIGINT(60),
    follower_account: DataTypes.STRING(60),
    time: DataTypes.BIGINT(20)
  }, 
  {
    paranoid: true,
    underscored: true
  });
  return Follower;
};