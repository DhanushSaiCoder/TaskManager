const express = require('express')
const mongoose = require('mongoose')
const { Task, validate } = require('../models/Task')
const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find()
        res.send(tasks)
    } catch (err) {
        console.error('error while getting tasks', err)
    }
})

router.post('/', async (req, res) => {
    try {
        const { error, value } = validate(req.body);
        if (error) { return res.status(400).send(error.details[0].message); }

        const task = new Task(value);

        const result = await task.save()
        res.status(200).send(result)

    } catch (err) {
        console.error('error in post route', err)
    }
})

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
