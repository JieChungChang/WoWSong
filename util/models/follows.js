module.exports = (sequelize, DataTypes) => {
  const Follow = sequelize.define('follow', 
  {
    account: DataTypes.BIGINT(20),
    follower_account: DataTypes.STRING(20),
    time: DataTypes.BIGINT(20)
  }, 
  {
    paranoid: true,
    underscored: true
  });
  return Follow;
};