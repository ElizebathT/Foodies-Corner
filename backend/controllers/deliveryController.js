const Delivery = require("../models/Delivery");

exports.assignDelivery = async (req, res) => {
  try {
    const { orderId, driverId, estimatedDeliveryTime } = req.body;

    const delivery = new Delivery({
      order: orderId,
      driver: driverId,
      estimatedDeliveryTime,
    });

    await delivery.save();
    res.status(201).json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { status } = req.body;

    const delivery = await Delivery.findByIdAndUpdate(deliveryId, { status }, { new: true });

    if (!delivery) return res.status(404).json({ message: "Delivery not found" });

    res.json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDeliveryByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const delivery = await Delivery.findOne({ order: orderId }).populate("driver");

    if (!delivery) return res.status(404).json({ message: "Delivery not found" });

    res.json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
