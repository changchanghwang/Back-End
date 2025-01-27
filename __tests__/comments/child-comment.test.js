jest.mock('../../models/either');
jest.mock('../../models/votes');
jest.mock('../../models/users');
jest.mock('../../models/multi');
jest.mock('../../models/likes');
jest.mock('../../models/comments');
jest.mock('../../models/child-comments');
jest.mock('../../models/comment-likes');
const { ChildComment, CommentLike, User } = require('../../models');
const {
  postChildComment,
  editChildComment,
  deleteChildComment,
  likeChildComment,
} = require('../../controllers/child-comment');

describe('대댓글 등록', () => {
  const req = {
    params: {
      multi_id: '1',
      comment_id: '1',
    },
    body: {
      comment: '안녕하세요의안녕하세요',
      date: '2021-10-26 11:04:52',
    },
  };
  const res = {
    status: jest.fn(() => res),
    json: jest.fn(),
    locals: {
      user: '1',
    },
  };
  const next = jest.fn();
  test('대댓글 등록에 성공하면 success:true를 보내준다', async () => {
    await ChildComment.create.mockReturnValue({
      dataValues: {
        edited: false,
        editedDate: null,
        deleted: false,
        likeCnt: 0,
        id: 15,
        user: 4,
        multi: '1',
        parentComment: '1',
        comment: 'asdfwadsfaf',
        date: '2021-11-03 21:32:12',
      },
    });
    await User.findOne.mockReturnValue({
      nickname: '황창',
    });
    await postChildComment(req, res, next);
    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith({
      success: true,
      childComment: {
        edited: false,
        editedDate: null,
        deleted: false,
        likeCnt: 0,
        id: 15,
        user: 4,
        nickname: '황창',
        multi: '1',
        parentComment: '1',
        comment: 'asdfwadsfaf',
        date: '2021-11-03 21:32:12',
      },
    });
  });
  test('댓글 작성시 DB에러(create) 발생 시 next(err)를 호출한다', async () => {
    const err = 'DB에러';
    await ChildComment.create.mockRejectedValue(err);
    await postChildComment(req, res, next);
    expect(next).toBeCalledWith(err);
  });
  test('댓글 작성시 DB에러(findOne) 발생 시 next(err)를 호출한다', async () => {
    const err = 'DB에러';
    await ChildComment.create.mockReturnValue({
      dataValues: {
        edited: false,
        editedDate: null,
        deleted: false,
        likeCnt: 0,
        id: 15,
        user: 4,
        multi: '1',
        parentComment: '1',
        comment: 'asdfwadsfaf',
        date: '2021-11-03 21:32:12',
      },
    });
    await User.findOne.mockRejectedValue(err);
    await postChildComment(req, res, next);
    expect(next).toBeCalledWith(err);
  });
});

describe('대댓글 수정', () => {
  const req = {
    params: {
      multi_id: '1',
      comment_id: '1',
    },
    body: {
      comment: '하하하하하',
      editedDate: '2021-10-27 22:51:22',
    },
  };
  const res = {
    locals: {
      user: '1',
    },
    status: jest.fn(() => res),
    json: jest.fn(),
  };
  const next = jest.fn();
  test('대댓글수정에 성공하면 response로 success:true를 보낸다', async () => {
    await ChildComment.findOne
      .mockReturnValueOnce(
        Promise.resolve({
          id: 1,
          comment: '댓글입니다!',
          date: '2021-10-27 11:10:8',
          edited: false,
          editedDate: null,
          user: '1',
          multi: '1',
        })
      )
      .mockReturnValueOnce(
        Promise.resolve({
          dataValues: {
            id: 1,
            comment: '하하하하하',
            date: '2021-10-27 11:10:8',
            edited: true,
            editedDate: '2021-10-27 22:51:22',
            user: '1',
            multi: '1',
          },
        })
      );
    await ChildComment.update.mockReturnValue(
      Promise.resolve({
        id: 1,
        comment: '하하하하하',
        date: '2021-10-27 11:10:8',
        edited: true,
        editedDate: '2021-10-27 22:51:22',
        user: '1',
        multi: '1',
      })
    );
    await User.findOne.mockReturnValue({
      nickname: '황창',
    });
    await editChildComment(req, res, next);
    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith({
      success: true,
      childComment: {
        id: 1,
        comment: '하하하하하',
        date: '2021-10-27 11:10:8',
        nickname: '황창',
        edited: true,
        editedDate: '2021-10-27 22:51:22',
        user: '1',
        multi: '1',
      },
    });
  });
  test('대댓글 수정 시 수정할 댓글을 찾지 못하면 response로 success:false를 보낸다', async () => {
    await ChildComment.findOne.mockReturnValue(null);
    await editChildComment(req, res, next);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({ success: false });
  });
  test('DB 에러(findOne) 시 next(err)를 호출한다.', async () => {
    const err = 'DB에러';
    await ChildComment.findOne.mockRejectedValue(err);
    await editChildComment(req, res, next);
    expect(next).toBeCalledWith(err);
  });
  test('DB 에러(update) 시 next(err)를 호출한다.', async () => {
    const err = 'DB에러';
    await ChildComment.findOne.mockRejectedValueOnce({
      id: 1,
      comment: '하하하하하',
      date: '2021-10-27 11:10:8',
      edited: true,
      editedDate: '2021-10-27 22:51:22',
      user: '1',
      multi: '1',
    });
    await ChildComment.update.mockRejectedValue(err);
    await editChildComment(req, res, next);
    expect(next).toBeCalledWith(err);
  });
  test('DB 에러(findOne 2번째) 시 next(err)를 호출한다.', async () => {
    const err = 'DB에러';
    await ChildComment.findOne
      .mockReturnValueOnce({
        id: 1,
        comment: '하하하하하',
        date: '2021-10-27 11:10:8',
        edited: true,
        editedDate: '2021-10-27 22:51:22',
        user: '1',
        multi: '1',
      })
      .mockReturnValueOnce({
        dataValues: {
          id: 1,
          comment: '하하하하하',
          date: '2021-10-27 11:10:8',
          edited: true,
          editedDate: '2021-10-27 22:51:22',
          user: '1',
          multi: '1',
        },
      });
    ChildComment.update.mockReturnValue(
      Promise.resolve({
        id: 1,
        comment: '하하하하하',
        date: '2021-10-27 11:10:8',
        edited: true,
        editedDate: '2021-10-27 22:51:22',
        user: '1',
        multi: '1',
      })
    );
    await editChildComment(req, res, next);
    expect(next).toBeCalledWith(err);
  });
  test('DB 에러(User.findOne) 시 next(err)를 호출한다.', async () => {
    const err = 'DB에러';
    await ChildComment.findOne
      .mockReturnValueOnce({
        id: 1,
        comment: '하하하하하',
        date: '2021-10-27 11:10:8',
        edited: true,
        editedDate: '2021-10-27 22:51:22',
        user: '1',
        multi: '1',
      })
      .mockRejectedValueOnce(err);
    ChildComment.update.mockReturnValue(
      Promise.resolve({
        id: 1,
        comment: '하하하하하',
        date: '2021-10-27 11:10:8',
        edited: true,
        editedDate: '2021-10-27 22:51:22',
        user: '1',
        multi: '1',
      })
    );
    await User.findOne.mockRejectedValue(err);
    await editChildComment(req, res, next);
    expect(next).toBeCalledWith(err);
  });
});

describe('대댓글 좋아요', () => {
  const req = {
    params: {
      multi_id: '1',
      comment_id: '1',
    },
  };
  const res = {
    status: jest.fn(() => res),
    json: jest.fn(),
    locals: {
      user: '1',
    },
  };
  const next = jest.fn();
  test('대댓글 좋아요가 성공하면 response로 success:true를 보내준다', async () => {
    await CommentLike.findOne.mockReturnValue(null);
    await CommentLike.create.mockReturnValue(
      Promise.resolve({
        id: '1',
        user: '1',
        childComment: '1',
        comment: null,
      })
    );
    await CommentLike.count.mockReturnValue(1);
    ChildComment.update.mockReturnValue(
      Promise.resolve({
        id: '1',
        user: '1',
        multi: '1',
        parentComment: '1',
        comment: '테스트',
        date: '2021-10-28 14:16:11',
        eidited: false,
        editedDate: null,
        deleted: false,
        likeCnt: '1',
      })
    );
    await likeChildComment(req, res, next);
    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith({
      success: true,
      likeCnt: 1,
    });
  });
  test('대댓글 좋아요가 이미 되어 있으면 response로 success:false를 보내준다', async () => {
    CommentLike.findOne.mockReturnValue(
      Promise.resolve({
        id: '1',
        user: '1',
        childComment: '1',
        comment: null,
      })
    );
    await likeChildComment(req, res, next);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({ success: false });
  });
  test('DB 요청(findOne)에 대한 에러가 발생', async () => {
    const err = 'DB error';
    await CommentLike.findOne.mockRejectedValue(err);
    await likeChildComment(req, res, next);
    expect(next).toBeCalledWith(err);
  });
  test('DB 요청(findOne 성공시 create에서 에러)에 대한 에러가 발생', async () => {
    const err = 'DB error';
    CommentLike.findOne.mockReturnValue(
      Promise.resolve({
        id: '1',
        user: '1',
        childComment: '1',
        comment: null,
      })
    );
    await CommentLike.create.mockRejectedValue(err);
    await likeChildComment(req, res, next);
    expect(next).toBeCalledWith(err);
  });
  test('DB 요청(findOne,create 성공시 count에서 에러)에 대한 에러가 발생', async () => {
    const err = 'DB error';
    CommentLike.findOne.mockReturnValue(
      Promise.resolve({
        id: '1',
        user: '1',
        childComment: '1',
        comment: null,
      })
    );
    await CommentLike.create.mockReturnValue(
      Promise.resolve({
        id: '1',
        user: '1',
        childComment: '1',
        comment: null,
      })
    );
    await CommentLike.count.mockRejectedValue(err);
    await likeChildComment(req, res, next);
    expect(next).toBeCalledWith(err);
  });
  test('DB 요청(findOne,create,count 성공시 update에서 에러)에 대한 에러가 발생', async () => {
    const err = 'DB error';
    CommentLike.findOne.mockReturnValue(
      Promise.resolve({
        id: '1',
        user: '1',
        childComment: '1',
        comment: null,
      })
    );
    await CommentLike.create.mockReturnValue(
      Promise.resolve({
        id: '1',
        user: '1',
        childComment: '1',
        comment: null,
      })
    );
    await CommentLike.count.mockReturnValue(1);
    await ChildComment.update.mockRejectedValue(err);
    await likeChildComment(req, res, next);
    expect(next).toBeCalledWith(err);
  });
});
describe('대댓글 삭제', () => {
  const req = {
    params: {
      multi_id: 1,
      comment_id: 1,
    },
    body: {
      comment: '안녕',
      date: '2021-11-03 17:38:45',
    },
  };
  const res = {
    locals: {
      user: 1,
    },
    status: jest.fn(() => res),
    json: jest.fn(),
  };
  const next = jest.fn();
  const err = 'db에러';
  test('삭제에 성공하면 response로 success:true와 대댓글정보를 보내준다', async () => {
    await ChildComment.findOne
      .mockReturnValueOnce(
        Promise.resolve({
          edited: false,
          deleted: false,
          likeCnt: 0,
          id: 7,
          user: 4,
          multi: '1',
          parentComment: '1',
          comment: 'asdf',
          date: '2021-11-03 17:16:57',
        })
      )
      .mockReturnValueOnce(
        Promise.resolve({
          dataValues: {
            edited: false,
            deleted: false,
            likeCnt: 0,
            id: 7,
            user: 4,
            multi: '1',
            parentComment: '1',
            comment: 'qqqq',
            date: '2021-11-03 17:16:57',
          },
        })
      );
    await ChildComment.update.mockReturnValue(
      Promise.resolve({
        edited: false,
        deleted: false,
        likeCnt: 0,
        id: 7,
        user: 4,
        multi: '1',
        parentComment: '1',
        comment: 'qqqq',
        date: '2021-11-03 17:16:57',
      })
    );
    await User.findOne.mockReturnValue({
      nickname: '황창',
    });
    await deleteChildComment(req, res, next);
    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith({
      success: true,
      childComment: {
        edited: false,
        deleted: false,
        likeCnt: 0,
        id: 7,
        user: 4,
        multi: '1',
        parentComment: '1',
        comment: 'qqqq',
        date: '2021-11-03 17:16:57',
        nickname: '황창',
      },
    });
  });

  test('해당 childComment가 없으면 status 400과 success: false를 반환한다', async () => {
    await ChildComment.findOne.mockReturnValue(null);
    await deleteChildComment(req, res, next);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({ success: false });
  });

  test('DB 에러(첫번째 findOne에서 에러)', async () => {
    await ChildComment.findOne.mockRejectedValue(err);
    await deleteChildComment(req, res, next);
    expect(next).toBeCalledWith(err);
  });

  test('DB 에러(첫번째 findOne에서 통과, update에서 실패)', async () => {
    await ChildComment.findOne.mockReturnValueOnce(
      Promise.resolve({
        edited: false,
        deleted: false,
        likeCnt: 0,
        id: 7,
        user: 4,
        multi: '1',
        parentComment: '1',
        comment: 'asdf',
        date: '2021-11-03 17:16:57',
      })
    );
    await ChildComment.update.mockRejectedValue(err);
    await deleteChildComment(req, res, next);
    expect(next).toBeCalledWith(err);
  });

  test('DB 에러(두번째 findOne에서 에러)', async () => {
    await ChildComment.findOne
      .mockReturnValueOnce(
        Promise.resolve({
          edited: false,
          deleted: false,
          likeCnt: 0,
          id: 7,
          user: 4,
          multi: '1',
          parentComment: '1',
          comment: 'asdf',
          date: '2021-11-03 17:16:57',
        })
      )
      .mockRejectedValueOnce(err);
    await ChildComment.update.mockReturnValue(
      Promise.resolve({
        edited: false,
        deleted: false,
        likeCnt: 0,
        id: 7,
        user: 4,
        multi: '1',
        parentComment: '1',
        comment: 'qqqq',
        date: '2021-11-03 17:16:57',
      })
    );
    await deleteChildComment(req, res, next);
    expect(next).toBeCalledWith(err);
  });

  test('DB 에러(User.findOne에서 에러)', async () => {
    await ChildComment.findOne
      .mockReturnValueOnce(
        Promise.resolve({
          edited: false,
          deleted: false,
          likeCnt: 0,
          id: 7,
          user: 4,
          multi: '1',
          parentComment: '1',
          comment: 'asdf',
          date: '2021-11-03 17:16:57',
        })
      )
      .mockRejectedValueOnce(
        Promise.resolve({
          dataValues: {
            edited: false,
            deleted: false,
            likeCnt: 0,
            id: 7,
            user: 4,
            multi: '1',
            parentComment: '1',
            comment: 'asdf',
            date: '2021-11-03 17:16:57',
          },
        })
      );
    await ChildComment.update.mockReturnValue(
      Promise.resolve({
        edited: false,
        deleted: false,
        likeCnt: 0,
        id: 7,
        user: 4,
        multi: '1',
        parentComment: '1',
        comment: 'qqqq',
        date: '2021-11-03 17:16:57',
      })
    );
    await User.findOne.mockRejectedValue(err);
    await deleteChildComment(req, res, next);
    expect(next).toBeCalledWith(err);
  });
});
