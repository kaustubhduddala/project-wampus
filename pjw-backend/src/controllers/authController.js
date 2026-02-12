const supabase = require('../config/supabase');
const prisma = require('../db/db');

const ADMIN_PERMISSION_CODE = process.env.ADMIN_CODE;

const authController = {

    signUp: async (req, res) => {
        const { email, password, adminPermissionCode } = req.body;

        try {
            let intendedRole = 'USER';
            if (adminPermissionCode) {
                if (adminPermissionCode === ADMIN_PERMISSION_CODE) {
                    intendedRole = 'ADMIN';
                } else {
                    return res.status(400).json({ error: 'Invalid Admin Permission Code' });
                }
            }

            
            const { data, error } = await supabase.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true,
                user_metadata: { role: intendedRole } 
            });

            if (error) {
                return res.status(400).json({ error: error.message });
            }

           
            if (intendedRole === 'ADMIN') {
                await prisma.user_roles.update({
                    where: { user_id: data.user.id },
                    data: { role: 'ADMIN' }
                });
            }

            res.status(201).json({ 
                message: "User created successfully", 
                user: data.user, 
                role: intendedRole 
            });

        } catch (err) {
            console.error("SignUp Error:", err);
            res.status(500).json({ message: "Internal Server Error during signup" });
        }
    },

    signIn: async (req, res) => {
        const { email, password } = req.body;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return res.status(401).json({ error: error.message });
            }

            const userRole = await prisma.user_roles.findUnique({
                where: { user_id: data.user.id }
            });

            res.status(200).json({ 
                message: "Login successful",
                token: data.session.access_token, 
                user: data.user,
                role: userRole?.role || 'USER'
            });

        } catch (err) {
            console.error("SignIn Error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
};

module.exports = authController;