const express = require("express");
const { assignDelivery, updateDeliveryStatus, getDeliveryByOrder } = require("../controllers/deliveryController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", protect, assignDelivery);
router.put("/:deliveryId", protect, updateDeliveryStatus);
router.get("/order/:orderId", protect, getDeliveryByOrder);

module.exports = router;
