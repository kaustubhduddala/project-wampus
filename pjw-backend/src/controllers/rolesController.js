const prisma = require('../db/db');

const rolesController = {
    // Update a user's role
    updateUserRole: async (req, res) => {
        const { userId } = req.params; // id of user to update
        const { newRole } = req.body;  // new role to assign
        
        try {
            // requireRole('OWNER') should be applied as middleware on the route
           // verify new role is valid
            const allowedRoles = ['ADMIN', 'USER'];
            if (!allowedRoles.includes(newRole)) {
                return res.status(400).json({ message: `Invalid role. Allowed values: ${allowedRoles.join(', ')}` });
            }

            // perform the update
            const updatedUserRole = await prisma.user_roles.upsert({
                where: { 
                    user_id: userId 
                },
                update: { 
                    role: newRole 
                },
                create: { 
                    user_id: userId, 
                    role: newRole 
                }
            });

            res.status(200).json({ 
                message: "Role updated successfully", 
                data: updatedUserRole 
            });

        } catch (error) {
            console.error("Error updating role:", error);
            if (error.code === 'P2003') {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(500).json({ message: "Failed to update user role" });
        }
    },

    getAllUserRoles: async (req, res) => {
        try {
         
            const roles = await prisma.user_roles.findMany({
                include: {
                    users: {
                        select: { email: true, phone: true } 
                    }
                }
            });
            res.status(200).json(roles);
        } catch (error) {
            console.error("Error fetching roles:", error);
            res.status(500).json({ message: "Failed to retrieve roles" });
        }
    }
};

module.exports = rolesController;