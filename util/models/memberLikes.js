module.exports = (sequelize, DataTypes) => {
  const MemberLikes = sequelize.define('member_like', 
  {
    post_id: DataTypes.BIGINT(60),
    member_account: DataTypes.STRING(60),
    time: DataTypes.BIGINT(60)
  }, 
  {
    paranoid: true,
    underscored: true
  });
  return MemberLikes;
};