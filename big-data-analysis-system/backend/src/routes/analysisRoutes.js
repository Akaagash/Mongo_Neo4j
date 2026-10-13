const express = require('express');
const router = express.Router();
const {
  getSystemOverview,
  getPlayerPerformance,
  getTeamPerformance,
  getPlayerImpact,
  getPlayerMatchups,
  getDeliveryAnalytics,
  getPlayerDetail,
  getArchitectureBlueprint,
  getDynamicEntities
} = require('../controllers/analysisController');

router.get('/overview', getSystemOverview);
router.get('/player-performance', getPlayerPerformance);
router.get('/team-performance', getTeamPerformance);
router.get('/player-impact', getPlayerImpact);
router.get('/matchups', getPlayerMatchups);
router.get('/delivery-analytics', getDeliveryAnalytics);
router.get('/player-detail', getPlayerDetail);
router.get('/architecture-blueprint', getArchitectureBlueprint);
router.get('/dynamic/:db/:entity', getDynamicEntities);

module.exports = router;
