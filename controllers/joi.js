const Joi = require('joi');

module.exports = {
  signUpSchema: Joi.object({
    // 회원가입 Schema
    userId: Joi.string()
      .required()
      .min(5)
      .max(20)
      .pattern(/^[a-z0-9_-]{5,20}$/),
    nickname: Joi.string().required(),
    pw: Joi.string()
      .required()
      .min(8)
      .max(16)
      .pattern(/^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])[a-z0-9!@#$%^&*?-]{8,16}$/),
    confirmPw: Joi.ref('pw'),
    ageGroup: Joi.number().required(),
  }),

  eitherSchema: Joi.object({
    // 찬반투표 게시물 Schema
    title: Joi.string().required(),
    contentA: Joi.string().required(),
    contentB: Joi.string().required(),
    date: Joi.string().required(),
  }),

  multiSchema: Joi.object({
    // 객관식 게시물 Schema
    title: Joi.string().required().min(1),
    description: Joi.string().required().min(1),
    contentA: Joi.string().required(),
    contentB: Joi.string().required(),
    contentC: Joi.string().allow(null),
    contentD: Joi.string().allow(null),
    contentE: Joi.string().allow(null),
    date: Joi.string().required(),
  }),

  postCommentSchema: Joi.object({
    // 댓글 작성 Schema
    comment: Joi.string().required().min(1),
    date: Joi.string().required(),
  }),

  editCommentSchema: Joi.object({
    // 댓글 수정 Schema
    comment: Joi.string().required(),
    editedDate: Joi.string().required(),
  }),
};
