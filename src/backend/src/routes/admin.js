const express = require('express');
const router = express.Router();

// GET /api/admin/stats - Статистика
router.get('/stats', (req, res) => {
  try {
    res.json({
      total_approvals: 0,
      approved: 0,
      rejected: 0,
      timeout: 0,
      avg_response_time: '0h',
      top_approvers: []
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get stats',
      message: error.message
    });
  }
});

// GET /api/admin/metrics - Метрики системы
router.get('/metrics', (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    
    res.json({
      cpu_usage: '15%',
      memory_usage: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      disk_usage: '30%',
      active_connections: 0,
      requests_per_minute: 0
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get metrics',
      message: error.message
    });
  }
});

module.exports = router;
