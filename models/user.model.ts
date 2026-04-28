import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    position?: string;
    skills: string[];
    address?: mongoose.Types.ObjectId[];
    isGod: boolean;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
    checkGod(): boolean;
    comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false, // không trả về mặc định
        },

        position: {
            type: String,
            trim: true,
            maxlength: 100,
        },

        skills: {
            type: [String],
            default: [],
            set: (value: unknown) => {
                if (!Array.isArray(value)) return []

                // Normalize: trim, drop empty, dedupe case-insensitively (keep first occurrence)
                const seen = new Set<string>()
                const normalized: string[] = []

                for (const item of value) {
                    const raw = typeof item === "string" ? item : String(item ?? "")
                    const trimmed = raw.trim()
                    if (!trimmed) continue
                    const key = trimmed.toLowerCase()
                    if (seen.has(key)) continue
                    seen.add(key)
                    normalized.push(trimmed)
                }

                return normalized
            },
        },

        address: [
            {
                type: Schema.Types.ObjectId,
                ref: "Address",
            },
        ],

        isGod: {
            type: Boolean,
            default: false,
        },
        resetPasswordToken: {
            type: String,
            select: false,
        },
        resetPasswordExpires: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// kiểm tra super admin
UserSchema.methods.checkGod = function (): boolean {
    return this.isGod === true;
};

// so sánh mật khẩu
UserSchema.methods.comparePassword = async function (
    candidate: string
): Promise<boolean> {
    return bcrypt.compare(candidate, this.password);
};

UserSchema.index({ position: 1 });
UserSchema.index({ skills: 1 });

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
