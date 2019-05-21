module.exports = (sequelize, DataTypes) => {
  const MemberLikes = sequelize.define('member_like', 
  {
    post_id: DataTypes.BIGINT(20),
    member_account: DataTypes.STRING(20),
    time: DataTypes.BIGINT(20)
  }, 
  {
    paranoid: true,
    underscored: true
  });
  return MemberLikes;
};