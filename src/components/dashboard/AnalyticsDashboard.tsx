'use client';

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar, Legend
} from 'recharts';
import { Card, CardBody } from '@/components/ui';
import { AnalyticsData } from '@/app/actions/analytics';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, AlertCircle, Clock } from 'lucide-react';

interface AnalyticsDashboardProps {
    data: AnalyticsData;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background/80 backdrop-blur-xl border border-border p-4 rounded-xl shadow-xl">
                <p className="font-semibold mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {
                            entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('value')
                                ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(entry.value)
                                : entry.value
                        }
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Total Revenue', value: data.totalRevenue, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { title: 'Pending Amount', value: data.pendingRevenue, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { title: 'Overdue Amount', value: data.overdueRevenue, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
                    { title: 'Avg. Invoice Value', value: data.averageInvoiceValue, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardBody className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                        <h3 className="text-2xl font-bold mt-2 font-display">
                                            {formatCurrency(stat.value)}
                                        </h3>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2"
                >
                    <Card className="h-[400px] border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardBody className="p-6 h-full flex flex-col">
                            <h3 className="text-lg font-semibold mb-6">Revenue Trend</h3>
                            <div className="flex-1 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.monthlyRevenue}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            hide
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }} />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#8b5cf6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                            name="Revenue"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Status Distribution */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="h-[400px] border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardBody className="p-6 h-full flex flex-col">
                            <h3 className="text-lg font-semibold mb-6">Invoice Status</h3>
                            <div className="flex-1 min-h-0 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.statusDistribution}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {data.statusDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <p className="text-3xl font-bold font-display">{data.statusDistribution.reduce((acc, curr) => acc + curr.value, 0)}</p>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Invoices</p>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            </div>

            {/* Top Buyers */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardBody className="p-6">
                        <h3 className="text-lg font-semibold mb-6">Top Performing Clients</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.topBuyers} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        width={100}
                                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 500 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                                    <Bar
                                        dataKey="value"
                                        fill="#3b82f6"
                                        radius={[0, 4, 4, 0]}
                                        barSize={32}
                                        name="Total Revenue"
                                        animationDuration={1500}
                                    >
                                        {
                                            data.topBuyers.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'][index % 5]} />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>
        </div>
    );
}
