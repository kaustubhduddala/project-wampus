const prisma = require('../db/db');

const petitionController = {
    // get all
    getPetitions: async (req, res) => {
        try {
            const petitions = await prisma.petitions.findMany({
                orderBy: { created_at: 'desc' }
            });
            res.status(200).json(petitions);
        } catch (error) {
            console.error("Error fetching petitions:", error);
            res.status(500).json({ message: "Failed to retrieve petitions" });
        }
    },


    createPetition: async (req, res) => {
        const { petition_title, petition_blurb, petition_link } = req.body;

        if (!petition_title || !petition_link) {
            return res.status(400).json({ message: "Title and link are required." });
        }

        try {
            const newPetition = await prisma.petitions.create({
                data: {
                    petition_title,
                    petition_blurb,
                    petition_link
                }
            });
            res.status(201).json({ message: "Petition created successfully", data: newPetition });
        } catch (error) {
            console.error("Error creating petition:", error);
            res.status(500).json({ message: "Failed to create petition" });
        }
    },

 
    updatePetition: async (req, res) => {
        const { id } = req.params;
        const { petition_title, petition_blurb, petition_link } = req.body;

        try {
            const updatedPetition = await prisma.petitions.update({
                where: { id: BigInt(id) },
                data: {
                    ...(petition_title && { petition_title }),
                    ...(petition_blurb && { petition_blurb }),
                    ...(petition_link && { petition_link })
                }
            });
            res.status(200).json({ message: "Petition updated successfully", data: updatedPetition });
        } catch (error) {
            console.error("Error updating petition:", error);
            if (error.code === 'P2025') {
                return res.status(404).json({ message: "Petition not found" });
            }
            res.status(500).json({ message: "Failed to update petition" });
        }
    }
};

module.exports = petitionController;