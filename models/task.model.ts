import mongoose, { Schema, Document, Model } from "mongoose";

export enum TaskStatus {
    BACKLOG = "backlog",
    TODO = "todo",
    IN_PROGRESS = "inprogress",
    DONE = "done",
    CANCELLED = "cancelled"
}
export enum PriorityLevel {
    NONE = "none",
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
}

export interface ITaskComment {
    _id?: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
}


export interface ITask extends Document {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: PriorityLevel;
    projectId: mongoose.Types.ObjectId;
    creatorId: mongoose.Types.ObjectId;
    assignees?: mongoose.Types.ObjectId[];
    labels?: string[];
    startDate?: Date;
    dueDate?: Date;
    estimate?: number;
    parentId?: mongoose.Types.ObjectId;
    comment?: string[];
    comments?: ITaskComment[];
    resource?: mongoose.Types.ObjectId[];
    overDue: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/* =========================
   SCHEMA
========================= */

const TaskSchema = new Schema<ITask>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
        },

        status: {
            type: String,
            enum: Object.values(TaskStatus),
            default: TaskStatus.BACKLOG,
        },

        priority: {
            type: String,
            enum: Object.values(PriorityLevel),
            default: PriorityLevel.NONE,
        },
        projectId: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        creatorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        assignees: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        labels: [
            {
                type: String,
            },
        ],

        startDate: {
            type: Date,
        },

        dueDate: {
            type: Date,
        },

        estimate: {
            type: Number,
        },

        parentId: {
            type: Schema.Types.ObjectId,
            ref: "Task",
        },

        comment: {
            type: String,
        },

        comments: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                content: {
                    type: String,
                    required: true,
                    trim: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        resource: [
            {
                type: Schema.Types.ObjectId,
                ref: "Resource",
            },
        ],
    },
    {
        timestamps: true,
    }
);


// tìm theo project/creator/status nhanh hơn
TaskSchema.index({ status: 1 });
TaskSchema.index({ creatorId: 1 });
TaskSchema.index({ dueDate: 1 });

const Task: Model<ITask> =
    mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;
