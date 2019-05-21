module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('member', 
  {
    provider: DataTypes.STRING(20),
    name: DataTypes.STRING(20),
    account: DataTypes.STRING(60),
    email:DataTypes.STRING(40),
    password: DataTypes.STRING,
    access_token: DataTypes.STRING, 
    access_expired: DataTypes.BIGINT(60),
    picture: DataTypes.STRING,
    verify: DataTypes.BOOLEAN
  }, 
  {
    paranoid: true,
    underscored: true
  });
  return Member;
};
