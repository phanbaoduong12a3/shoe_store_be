const express = require('express');
const router = express.Router();
const authRouter = require('./authRouter');
const userRouter = require('./userRouter');
const blogRouter = require('./blogRouter');
const brandRouter = require('./brandRouter');
const cartRouter = require('./cartRouter');
const categoryRouter = require('./categoryRouter');
const notificationRouters = require('./notificationRouter');
const orderRouters = require('./orderRouter');
const productRouter = require('./productRouter');
const reviewRouter = require('./reviewRouter');
const voucherRouter = require('./voucherRouter');

router.use(authRouter);
router.use(userRouter);
router.use(blogRouter);
router.use(brandRouter);
router.use(cartRouter);
router.use(categoryRouter);
router.use(notificationRouters);
router.use(orderRouters);
router.use(productRouter);
router.use(reviewRouter);
router.use(voucherRouter);

module.exports = router;