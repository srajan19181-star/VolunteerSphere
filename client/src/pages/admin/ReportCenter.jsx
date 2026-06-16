import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Users, Calendar, Clock, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportService, downloadBlob } from '../../services/reportService';
import { ReportSkeleton } from '../../components/skeletons/index';
import { fadeInUp, staggerContainer } from '../../utils/animations';
import Button from '../../components/ui/Button';
import { formatDate } from '../../utils/helpers';

const REPORT_TYPES = [
  { key: 'volunteers', label: 'Volunteer Report', desc: 'All volunteer profiles with hours and status.', icon: <Users size={22} className="text-accent-purple" />, color: 'bg-accent-purple/10' },
  { key: 'events', label: 'Event Report', desc: 'All events with category, date, and attendance.', icon: <Calendar size={22} className="text-accent-cyan" />, color: 'bg-accent-cyan/10' },
  { key: 'hours', label: 'Hours Report', desc: 'Hours logged per volunteer, sorted by total.', icon: <Clock size={22} className="text-accent-green" />, color: 'bg-accent-green/10' },
];

const ReportCenter = () => {
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('volunteers');
  const [previewData, setPreviewData] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    setLoading(false);
  }, []);

  const loadPreview = async () => {
    setPreviewLoading(true);
    try {
      let res;
      const params = { format: 'json', ...(from && { from }), ...(to && { to }) };
      if (activeReport === 'volunteers') res = await reportService.exportVolunteers(params);
      else if (activeReport === 'events') res = await reportService.exportEvents(params);
      else res = await reportService.exportHours(params);
      setPreviewData(res.data.data || []);
    } catch { toast.error('Failed to load preview'); }
    finally { setPreviewLoading(false); }
  };

  useEffect(() => { loadPreview(); }, [activeReport, from, to]);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const params = { format, ...(from && { from }), ...(to && { to }) };
      let res;
      if (activeReport === 'volunteers') res = await reportService.exportVolunteers(params);
      else if (activeReport === 'events') res = await reportService.exportEvents(params);
      else res = await reportService.exportHours(params);
      const ext = format === 'csv' ? 'csv' : 'pdf';
      downloadBlob(res.data, `${activeReport}-report.${ext}`);
      toast.success(`${format.toUpperCase()} downloaded!`);
    } catch { toast.error('Export failed'); }
    finally { setExporting(''); }
  };

  const getColumns = () => {
    if (activeReport === 'volunteers') return ['Name', 'Email', 'Hours', 'Status', 'Joined'];
    if (activeReport === 'events') return ['Title', 'Category', 'Date', 'Status', 'Registered'];
    return ['Name', 'Email', 'Total Hours'];
  };

  const getRow = (item) => {
    if (activeReport === 'volunteers') return [item.name, item.email, `${item.totalHours}h`, item.isActive ? 'Active' : 'Inactive', formatDate(item.joinedAt)];
    if (activeReport === 'events') return [item.title, item.category, formatDate(item.date), item.status, `${item.registeredCount}/${item.maxVolunteers}`];
    return [item.name, item.email, `${item.totalHours}h`];
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {loading ? <ReportSkeleton /> : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
          <motion.div variants={fadeInUp}>
            <h1 className="text-2xl font-display font-bold text-white">Report Center</h1>
            <p className="text-white/40 text-sm font-body">Export data as CSV or PDF</p>
          </motion.div>

          {/* Report type selector */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {REPORT_TYPES.map(({ key, label, desc, icon, color }) => (
              <button
                key={key}
                onClick={() => setActiveReport(key)}
                className={`text-left p-5 rounded-2xl border transition-all ${activeReport === key ? 'bg-white/10 border-accent-purple/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                id={`report-type-${key}`}
              >
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>{icon}</div>
                <p className="text-sm font-semibold text-white font-body">{label}</p>
                <p className="text-xs text-white/40 font-body mt-1">{desc}</p>
              </button>
            ))}
          </motion.div>

          {/* Date range + export */}
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-white/50 font-body">From</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-glass px-3 py-2 text-sm" id="report-from" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-white/50 font-body">To</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-glass px-3 py-2 text-sm" id="report-to" />
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="glass" size="sm" loading={exporting === 'csv'} onClick={() => handleExport('csv')} id="export-csv">
                <Download size={14} /> CSV
              </Button>
              <Button variant="primary" size="sm" loading={exporting === 'pdf'} onClick={() => handleExport('pdf')} id="export-pdf">
                <FileText size={14} /> PDF
              </Button>
            </div>
          </motion.div>

          {/* Preview Table */}
          <motion.div variants={fadeInUp} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
              <BarChart3 size={16} className="text-accent-purple" />
              <h3 className="text-sm font-semibold text-white font-body">Preview — {previewData.length} records</h3>
            </div>
            {previewLoading ? (
              <div className="p-8 text-center text-white/30 text-sm font-body">Loading preview...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {getColumns().map((col) => (
                        <th key={col} className="text-left text-xs font-semibold text-white/50 uppercase tracking-wider px-4 py-3 font-body">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {previewData.slice(0, 10).map((item, i) => (
                      <tr key={i} className="hover:bg-white/3 transition-colors">
                        {getRow(item).map((cell, j) => (
                          <td key={j} className="px-4 py-3 text-sm text-white/70 font-body">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length === 0 && (
                  <p className="text-center text-white/30 text-sm py-8 font-body">No data in selected range</p>
                )}
                {previewData.length > 10 && (
                  <p className="text-center text-white/30 text-xs py-3 font-body">Showing first 10 of {previewData.length} records. Export for full data.</p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ReportCenter;
