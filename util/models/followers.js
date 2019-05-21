module.exports = (sequelize, DataTypes) => {
  const Follower = sequelize.define('follow', 
  {
    account: DataTypes.BIGINT(20),
    follower_account: DataTypes.STRING(20),
    time: DataTypes.BIGINT(20)
  }, 
  {
    paranoid: true,
    underscored: true
  });
  return Follower;
};