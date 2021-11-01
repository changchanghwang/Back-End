const { Comment, CommentLike } = require('../models');
const { postCommentSchema, editCommentSchema } = require('./joi');

module.exports = {
  //댓글 작성
  postComment: async (req, res, next) => {
    try {
      const { comment, date } = await postCommentSchema.validateAsync(req.body);
      const { multi_id } = req.params;
      const user = res.locals.user;
      await Comment.create({
        user,
        multi: multi_id,
        comment,
        date,
      });
      res.status(200).json({
        success: true,
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
  // 댓글 수정
  editComment: async (req, res, next) => {
    try {
      const { comment, editedDate } = await editCommentSchema.validateAsync(req.body); // Todo --> 조이 확인
      const { multi_id, comment_id } = req.params;
      const user = res.locals.user;

      if (await Comment.findOne({ where: { user, multi: multi_id, id: comment_id } })) {
        await Comment.update(
          {
            comment,
            editedDate,
            edited: true,
          },
          { where: { user, multi: multi_id, id: comment_id } }
        );
        res.status(200).json({
          success: true,
        });
      } else {
        res.status(400).json({
          success: false,
        });
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
  // 댓글 삭제
  deleteComment: async (req, res, next) => {
    try {
      const { multi_id, comment_id } = req.params;
      const user = res.locals.user;
      console.log(req.params);
      if (await Comment.findOne({ where: { user, multi: multi_id, id: comment_id } })) {
        await Comment.update(
          {
            deleted: true,
          },
          { where: { user, multi: multi_id, id: comment_id } }
        );
        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ success: false });
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
  // 댓글 좋아요
  likeComment: async (req, res, next) => {
    const { multi_id, comment_id } = req.params;
    const user = res.locals.user;
    try {
      const likeExist = await CommentLike.findOne({
        where: { multi: multi_id, comment: comment_id, user },
      });
      if (likeExist) {
        return res.status(400).json({ success: false });
      } else {
        await CommentLike.create({ user, comment: comment_id });
        const likeCnt = await CommentLike.count({ where: { comment: comment_id } });
        await Comment.update({ likeCnt }, { wehre: { id: comment_id } });
        res.status(200).json({ success: true, likeCnt });
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
};
