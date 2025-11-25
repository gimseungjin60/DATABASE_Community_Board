const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 페이지당 게시물 수
const PAGE_SIZE = 5;

// 📌 목록 + 검색 + 페이지네이션
router.get("/", (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const keyword = req.query.keyword || "";
    const offset = (page - 1) * PAGE_SIZE;

    const search = `%${keyword}%`;

    // 총 게시글 수 가져오기
    db.query("SELECT COUNT(*) AS total FROM board WHERE title LIKE ?", [search], (err, countResult) => {
        if (err) throw err;

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / PAGE_SIZE);

        // 게시글 목록 가져오기
        db.query(
            "SELECT * FROM board WHERE title LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?",
            [search, PAGE_SIZE, offset],
            (err, rows) => {
                if (err) throw err;
                res.render("board/list", {
                    boardList: rows,
                    page,
                    totalPages,
                    keyword
                });
            }
        );
    });
});

// 📌 게시물 보기 + 조회수 증가
router.get("/view/:id", (req, res) => {
    const id = req.params.id;

    // 조회수 증가
    db.query("UPDATE board SET hit = hit + 1 WHERE id = ?", [id]);

    db.query("SELECT * FROM board WHERE id = ?", [id], (err, rows) => {
        if (err) throw err;
        res.render("board/view", { post: rows[0] });
    });
});

// 📌 작성 화면
router.get("/write", (req, res) => {
    res.render("board/write");
});

// 📌 작성 저장
router.post("/write", (req, res) => {
    const { title, writer, content } = req.body;

    db.query(
        "INSERT INTO board (title, writer, content) VALUES (?, ?, ?)",
        [title, writer, content],
        (err) => {
            if (err) throw err;
            res.redirect("/board");
        }
    );
});

// 📌 수정 화면
router.get("/modify/:id", (req, res) => {
    const id = req.params.id;

    db.query("SELECT * FROM board WHERE id = ?", [id], (err, rows) => {
        if (err) throw err;
        res.render("board/modify", { post: rows[0] });
    });
});

// 📌 수정 저장
router.post("/modify/:id", (req, res) => {
    const id = req.params.id;
    const { title, writer, content } = req.body;

    db.query(
        "UPDATE board SET title=?, writer=?, content=? WHERE id=?",
        [title, writer, content, id],
        (err) => {
            if (err) throw err;
            res.redirect("/board/view/" + id);
        }
    );
});

// 📌 삭제
router.get("/delete/:id", (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM board WHERE id = ?", [id], (err) => {
        if (err) throw err;
        res.redirect("/board");
    });
});

module.exports = router;
