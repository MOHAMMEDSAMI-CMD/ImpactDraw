import express from "express";
import DrawEntry from "../models/DrawEntry.js";
import Draw from "../models/Draw.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();


// ==========================================
// GET ACTIVE DRAW
// GET /api/draws/active
// ==========================================

router.get(
    "/active",
    requireAuth,
    async (req, res) => {
        try {

            const draw = await Draw.findOne({
                status: "open"
            }).sort({
                createdAt: -1
            });

            if (!draw) {
                return res.json({
                    success: true,
                    draw: null
                });
            }

            res.json({
                success: true,
                draw
            });

        } catch (error) {

            console.error(
                "Get active draw error:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Failed to load active draw"
            });

        }
    }
);


// ==========================================
// GET ALL DRAWS
// GET /api/draws
// ==========================================

router.get(
    "/",
    requireAuth,
    async (req, res) => {

        try {

            const draws = await Draw.find()
                .sort({
                    createdAt: -1
                });

            res.json({
                success: true,
                draws
            });

        } catch (error) {

            console.error(
                "Get draws error:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Failed to load draws"
            });

        }

    }
);


// ==========================================
// ENTER MONTHLY DRAW
// POST /api/draws/enter
// ==========================================

router.post(
    "/enter",
    requireAuth,
    async (req, res) => {

        console.log("ENTER DRAW BODY:", req.body);

console.log("LOGIN USER:", req.user);

        try {

            const { numbers } = req.body;


            // =====================================
            // GET USER
            // =====================================

            const user = await User.findById(
                req.user._id
            );

            if (!user) {

                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });

            }


            // =====================================
            // SUBSCRIPTION CHECK
            // =====================================

            if (
                user.subscriptionStatus !== "active"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Active subscription required"
                });

            }


            // =====================================
            // VALIDATE NUMBERS
            // =====================================

            if (
                !Array.isArray(numbers) ||
                numbers.length !== 5
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Select exactly 5 numbers"
                });

            }


            const selectedNumbers =
                numbers.map(Number);


            // =====================================
            // RANGE CHECK
            // =====================================

            const invalid =
                selectedNumbers.some(
                    (num) =>
                        !Number.isInteger(num) ||
                        num < 1 ||
                        num > 45
                );


            if (invalid) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Numbers must be between 1 and 45"
                });

            }


            // =====================================
            // DUPLICATE CHECK
            // =====================================

            if (
                new Set(selectedNumbers).size !== 5
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Numbers must be unique"
                });

            }


            // =====================================
            // SORT NUMBERS
            // =====================================

            selectedNumbers.sort(
                (a, b) => a - b
            );


            // =====================================
            // FIND ACTIVE DRAW
            // =====================================
            const draw =
                await Draw.findOne({
                    status: {
                        $in: [
                            "pending",
                            "open"
                        ]
                    }
                })
                .sort({
                    createdAt: -1
                });
                console.log("FOUND DRAW:", draw);


            if (!draw) {

                return res.status(400).json({
                    success: false,
                    message:
                        "No active draw available"
                });

            }


            // =====================================
            // CHECK ALREADY ENTERED
            // =====================================

            const exists =
                await DrawEntry.findOne({

                    user: user._id,

                    draw: draw._id

                });


            if (exists) {

                return res.status(400).json({
                    success: false,
                    message:
                        "You already entered this draw"
                });

            }


            // =====================================
            // CREATE ENTRY
            // =====================================

            const entry =
                await DrawEntry.create({

                    user: user._id,

                    draw: draw._id,

                    numbers: selectedNumbers

                });


            // =====================================
            // UPDATE USER STATS
            // =====================================

            user.drawsEntered =
                (user.drawsEntered || 0) + 1;

            await user.save();


            // =====================================
            // RESPONSE
            // =====================================

            return res.status(201).json({

                success: true,

                message:
                    "Draw entry submitted successfully",

                entry

            });


        } catch (error) {

            console.error(
                "Draw entry error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to enter draw"

            });

        }

    }
);


export default router;