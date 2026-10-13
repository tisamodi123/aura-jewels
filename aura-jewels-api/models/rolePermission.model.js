import mongoose from "mongoose";

// One document per staff role (admin / sales / inventory) holding the list of
// granted permission action strings. Super Admin is intentionally NOT stored —
// it bypasses all checks. Editable from the admin "Roles & Permissions" screen.
const rolePermissionSchema = new mongoose.Schema(
    {
        role: { type: String, required: true, unique: true, lowercase: true, trim: true },
        label: { type: String, default: "" },
        permissions: { type: [String], default: [] },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    },
    { timestamps: true, versionKey: false }
);

export default mongoose.model("RolePermission", rolePermissionSchema);
