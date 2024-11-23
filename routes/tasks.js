const express = require('express')
const mongoose = require('mongoose')
const { Task, validate } = require('../models/Task')
const authenticateToken = require('../middlewares/authenticateToken')
const router = express.Router()
router.get('/', authenticateToken, async (req, res) => {
    try {
        const tasks = await Task.find({user: req.user.userId})
        res.send(tasks)
    } catch (err) {
        console.error('error while getting tasks', err)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).send('Task not found');
        }
        res.send(task);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { error, value } = validate(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        // Create a new task and include the user ID
        const task = new Task({
            title: value.title,
            description: value.description,
            user: req.user.userId // Ensure `userId` is part of the decoded token payload
        });

        const result = await task.save();
        res.status(200).send(result);

    } catch (err) {
        console.error('error in post route', err);
        res.status(500).send('Server error');
    }
});



router.patch('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!task) return res.status(404).send('Task not found')
        res.send(task)
    } catch (error) {
        console.error('error while patch', error)
    }
})

router.delete("/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id)
        if (!task) return res.status(404).send('Task not found')

        res.status(200).send(task)
    } catch (err) {
        console.error('error while deleting task',err)
    }
})
module.exports = router
