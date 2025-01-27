const { ChildComment, CommentLike, User } = require('../models');
const { postCommentSchema, editCommentSchema } = require('./joi');

module.exports = {
  //대댓글 작성
  postChildComment: async (req, res, next) => {
    try {
      const { comment, date } = await postCommentSchema.validateAsync(req.body);
      const { multi_id, comment_id } = req.params;
      const user = res.locals.user;
      const childMent = await ChildComment.create({
        user,
        multi: multi_id,
        parentComment: comment_id,
        comment,
        date,
      });
      const nickname = await User.findOne({
        attributes: ['nickname'],
        where: { id: user },
        raw: true,
      });
      const childComment = Object.assign(nickname, childMent.dataValues);
      res.status(200).json({
        success: true,
        childComment,
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
  //대댓글 수정
  editChildComment: async (req, res, next) => {
    const { comment, editedDate } = await editCommentSchema.validateAsync(req.body);
    const { multi_id, comment_id } = req.params;
    const user = res.locals.user;
    try {
      const childExist = await ChildComment.findOne({
        where: { multi: multi_id, id: comment_id, user },
      });
      if (childExist) {
        await ChildComment.update(
          { comment, editedDate },
          { where: { multi: multi_id, id: comment_id, user } }
        );
        const childMent = await ChildComment.findOne({
          where: {
            multi: multi_id,
            id: comment_id,
            user,
          },
        });
        const nickname = await User.findOne({
          attributes: ['nickname'],
          where: { id: user },
          raw: true,
        });
        console.log(nickname);
        const childComment = Object.assign(nickname, childMent.dataValues);
        res.status(200).json({
          success: true,
          childComment,
        });
      } else {
        res.status(400).json({ success: false });
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
  // 대댓글 삭제
  deleteChildComment: async (req, res, next) => {
    try {
      const { multi_id, comment_id } = req.params;
      const user = res.locals.user;

      if (await ChildComment.findOne({ where: { user, multi: multi_id, id: comment_id } })) {
        await ChildComment.update(
          { deleted: true },
          { where: { user, multi: multi_id, id: comment_id } }
        );
        const childMent = await ChildComment.findOne({
          where: {
            multi: multi_id,
            id: comment_id,
            user,
          },
        });
        const nickname = await User.findOne({
          attributes: ['nickname'],
          where: { id: user },
          raw: true,
        });
        const childComment = Object.assign(nickname, childMent.dataValues);
        res.status(200).json({
          success: true,
          childComment,
        });
      } else {
        res.status(400).json({ success: false });
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
  //대댓글 좋아요
  likeChildComment: async (req, res, next) => {
    const { multi_id, comment_id } = req.params;
    const user = res.locals.user;
    try {
      const likeExist = await CommentLike.findOne({
        where: { multi: multi_id, childComment: comment_id, user },
      });
      if (likeExist) {
        return res.status(400).json({ success: false });
      } else {
        await CommentLike.create({ user, childComment: comment_id, multi: multi_id });
        const likeCnt = await CommentLike.count({
          where: { childComment: comment_id, multi: multi_id },
        });
        await ChildComment.update({ likeCnt }, { where: { id: comment_id, multi: multi_id } });
        res.status(200).json({ success: true, likeCnt });
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
};
