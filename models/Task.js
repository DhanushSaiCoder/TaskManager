const mongoose = require("mongoose");
const Joi = require('joi');



const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        
    },
    status: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
    

});
function validateTask(task) {
    const schema = Joi.object({
        title: Joi.string().min(3).max(255).required(),
        description: Joi.string().min(3).max(255).default('No description.'),
        status: Joi.boolean().required(),
        createdAt: Joi.date().default(Date.now),
        createdBy: Joi.string()
    });

    return schema.validate(task);
}


module.exports.Task = mongoose.model('Task', TaskSchema)
module.exports.validate = validateTask