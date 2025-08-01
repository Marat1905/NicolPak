import { useState, useEffect } from 'react';
import { 
  Table, 
  DatePicker, 
  Select, 
  Card, 
  Statistic,
  Row,
  Col,
  Spin,
  Tabs,
  Tag 
} from 'antd';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { DownloadOutlined, CalendarOutlined } from '@ant-design/icons';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

interface DailyReport {
  date: string;
  day: {
    downtimes: number;
    downtimeMinutes: number;
    production: number;
    waste: number;
  };
  night: {
    downtimes: number;
    downtimeMinutes: number;
    production: number;
    waste: number;
  };
}

interface MonthlySummary {
  month: string;
  totalDowntimes: number;
  totalDowntimeMinutes: number;
  totalProduction: number;
  totalWaste: number;
  dailyReports: DailyReport[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const generateTestData = (months: number): MonthlySummary[] => {
  const results: MonthlySummary[] = [];
  const now = dayjs();
  
  for (let i = 0; i < months; i++) {
    const monthDate = now.subtract(i, 'month');
    const daysInMonth = monthDate.daysInMonth();
    const dailyReports: DailyReport[] = [];
    
    let monthDowntimes = 0;
    let monthDowntimeMinutes = 0;
    let monthProduction = 0;
    let monthWaste = 0;
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDowntimes = Math.floor(Math.random() * 5);
      const dayDowntimeMinutes = Math.floor(Math.random() * 120);
      const dayProduction = 500 + Math.floor(Math.random() * 1500);
      const dayWaste = Math.floor(Math.random() * 50);
      
      const nightDowntimes = Math.floor(Math.random() * 4);
      const nightDowntimeMinutes = Math.floor(Math.random() * 90);
      const nightProduction = 300 + Math.floor(Math.random() * 1200);
      const nightWaste = Math.floor(Math.random() * 40);
      
      dailyReports.push({
        date: monthDate.date(d).format('YYYY-MM-DD'),
        day: {
          downtimes: dayDowntimes,
          downtimeMinutes: dayDowntimeMinutes,
          production: dayProduction,
          waste: dayWaste
        },
        night: {
          downtimes: nightDowntimes,
          downtimeMinutes: nightDowntimeMinutes,
          production: nightProduction,
          waste: nightWaste
        }
      });
      
      monthDowntimes += dayDowntimes + nightDowntimes;
      monthDowntimeMinutes += dayDowntimeMinutes + nightDowntimeMinutes;
      monthProduction += dayProduction + nightProduction;
      monthWaste += dayWaste + nightWaste;
    }
    
    results.push({
      month: monthDate.format('YYYY-MM'),
      totalDowntimes: monthDowntimes,
      totalDowntimeMinutes: monthDowntimeMinutes,
      totalProduction: monthProduction,
      totalWaste: monthWaste,
      dailyReports
    });
  }
  
  return results;
};

const MonthlyReport = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MonthlySummary[]>([]);
  const [filteredData, setFilteredData] = useState<DailyReport[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(dayjs().format('YYYY-MM'));
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  const [activeTab, setActiveTab] = useState('table');

  useEffect(() => {
    setTimeout(() => {
      const testData = generateTestData(12);
      setData(testData);
      updateFilteredData(testData, dayjs().format('YYYY-MM'));
      setLoading(false);
    }, 1000);
  }, []);

  const updateFilteredData = (allData: MonthlySummary[], month: string) => {
    const selectedMonthData = allData.find(item => item.month === month);
    if (selectedMonthData) {
      setFilteredData(selectedMonthData.dailyReports);
      setDateRange([
        dayjs(selectedMonthData.month + '-01').startOf('month'),
        dayjs(selectedMonthData.month + '-01').endOf('month')
      ]);
    }
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    updateFilteredData(data, value);
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange(dates);
      const month = dates[0].format('YYYY-MM');
      if (month !== selectedMonth) {
        setSelectedMonth(month);
        updateFilteredData(data, month);
      }
    }
  };

  const columns = [
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
      sorter: (a: DailyReport, b: DailyReport) => 
        dayjs(a.date).unix() - dayjs(b.date).unix()
    },
    {
      title: 'Смена',
      key: 'shift',
      render: (_: any, record: DailyReport) => (
        <div className="flex flex-col gap-2">
          <Tag color="blue">Дневная</Tag>
          <Tag color="purple">Ночная</Tag>
        </div>
      )
    },
    {
      title: 'Кол-во простоев',
      key: 'downtimes',
      render: (_: any, record: DailyReport) => (
        <div className="flex flex-col gap-2">
          <span>{record.day.downtimes}</span>
          <span>{record.night.downtimes}</span>
        </div>
      ),
      sorter: (a: DailyReport, b: DailyReport) => 
        (a.day.downtimes + a.night.downtimes) - (b.day.downtimes + b.night.downtimes)
    },
    {
      title: 'Время простоя (мин)',
      key: 'downtimeMinutes',
      render: (_: any, record: DailyReport) => (
        <div className="flex flex-col gap-2">
          <span>{record.day.downtimeMinutes}</span>
          <span>{record.night.downtimeMinutes}</span>
        </div>
      ),
      sorter: (a: DailyReport, b: DailyReport) => 
        (a.day.downtimeMinutes + a.night.downtimeMinutes) - 
        (b.day.downtimeMinutes + b.night.downtimeMinutes)
    },
    {
      title: 'Производство',
      key: 'production',
      render: (_: any, record: DailyReport) => (
        <div className="flex flex-col gap-2">
          <span>{record.day.production}</span>
          <span>{record.night.production}</span>
        </div>
      ),
      sorter: (a: DailyReport, b: DailyReport) => 
        (a.day.production + a.night.production) - 
        (b.day.production + b.night.production)
    },
    {
      title: 'Брак',
      key: 'waste',
      render: (_: any, record: DailyReport) => (
        <div className="flex flex-col gap-2">
          <span>{record.day.waste}</span>
          <span>{record.night.waste}</span>
        </div>
      ),
      sorter: (a: DailyReport, b: DailyReport) => 
        (a.day.waste + a.night.waste) - (b.day.waste + b.night.waste)
    }
  ];

  const getChartData = () => {
    return filteredData.map(item => ({
      date: dayjs(item.date).format('DD.MM'),
      dayDowntimes: item.day.downtimes,
      nightDowntimes: item.night.downtimes,
      dayProduction: item.day.production,
      nightProduction: item.night.production,
      dayWaste: item.day.waste,
      nightWaste: item.night.waste
    }));
  };

  const getPieData = () => {
    const currentMonth = data.find(item => item.month === selectedMonth);
    if (!currentMonth) return [];
    
    return [
      { name: 'Дневная смена', value: currentMonth.totalProduction / 2 },
      { name: 'Ночная смена', value: currentMonth.totalProduction / 2 },
      { name: 'Брак', value: currentMonth.totalWaste }
    ];
  };

  return (
      <div className="dark:bg-gray-900 dark:text-white">
          <PageMeta
              title="Отчет за месяц"
              description="Отчет за месяц"
          />
          <PageBreadcrumb pageTitle="Отчет за месяц" />

          <div className="p-4 dark:bg-gray-900">
              <Card
                  className="!dark:bg-gray-800 !dark:border-gray-700"
                  title={
                      <div className="flex items-center justify-between dark:text-white">
                          <div className="flex items-center gap-4">
                              <CalendarOutlined className="text-xl" />
                              <span>Отчет по производству</span>
                          </div>
                          <div className="flex gap-2">
                              <Select
                                  className="dark:[&>.ant-select-selector]:bg-gray-700 dark:[&>.ant-select-selector]:border-gray-600 dark:[&>.ant-select-selector]:text-white"
                                  value={selectedMonth}
                                  style={{ width: 200 }}
                                  onChange={handleMonthChange}
                                  loading={loading}
                              >
                                  {data.map(item => (
                                      <Option key={item.month} value={item.month}>
                                          {dayjs(item.month).format('MMMM YYYY')}
                                      </Option>
                                  ))}
                              </Select>
                              <RangePicker
                                  className="dark:[&>.ant-picker-input>input]:bg-gray-700 dark:[&>.ant-picker-input>input]:text-white dark:[&>.ant-picker]:bg-gray-700 dark:[&>.ant-picker]:border-gray-600"
                                  value={dateRange}
                                  onChange={handleDateRangeChange}
                                  format="DD.MM.YYYY"
                                  disabled={loading}
                              />
                          </div>
                      </div>
                  }
                  extra={<DownloadOutlined className="dark:text-white" />}
              >
                  <Spin spinning={loading}>
                      <Row gutter={16} className="mb-6">
                          {[
                              { title: "Всего простоев", value: data.find(item => item.month === selectedMonth)?.totalDowntimes || 0 },
                              { title: "Общее время простоя (мин)", value: data.find(item => item.month === selectedMonth)?.totalDowntimeMinutes || 0 },
                              { title: "Произведено продукции", value: data.find(item => item.month === selectedMonth)?.totalProduction || 0 },
                              { title: "Общий брак", value: data.find(item => item.month === selectedMonth)?.totalWaste || 0 }
                          ].map((stat, index) => (
                              <Col span={6} key={index}>
                                  <Card className="dark:bg-gray-700 dark:border-gray-600">
                                      <Statistic
                                          title={<span className="dark:text-gray-300">{stat.title}</span>}
                                          value={stat.value}
                                          valueStyle={{ color: '#fff' }}
                                      />
                                  </Card>
                              </Col>
                          ))}
                      </Row>

                      <Tabs
                          activeKey={activeTab}
                          onChange={setActiveTab}
                          className="dark:[&>.ant-tabs-nav]:before:border-b-gray-600"
                      >
                          <TabPane
                              tab={<span className="dark:text-gray-300">Таблица</span>}
                              key="table"
                          >
                              <Table
                                  className="dark:[&>.ant-table]:bg-gray-700 dark:[&>.ant-table]:text-white 
                        dark:[&>.ant-table-thead>tr>th]:bg-gray-600 dark:[&>.ant-table-thead>tr>th]:text-white
                        dark:[&>.ant-table-tbody>tr>td]:bg-gray-700 dark:[&>.ant-table-tbody>tr>td]:text-white
                        dark:[&>.ant-table-tbody>tr.ant-table-row:hover>td]:bg-gray-600"
                                  columns={columns}
                                  dataSource={filteredData}
                                  rowKey="date"
                                  pagination={{
                                      pageSize: 10,
                                      className: "dark:[&>.ant-pagination-item]:bg-gray-700 dark:[&>.ant-pagination-item]:border-gray-600 dark:[&>.ant-pagination-item>a]:text-white"
                                  }}
                                  scroll={{ x: true }}
                              />
                          </TabPane>
                          <TabPane
                              tab={<span className="dark:text-gray-300">Графики</span>}
                              key="charts"
                          >
                              <div className="grid grid-cols-1 gap-6 mt-4">
                                  {[
                                      { title: "Количество простоев по дням", type: "bar" },
                                      { title: "Производство продукции", type: "line" },
                                      { title: "Распределение производства", type: "pie" }
                                  ].map((chart, index) => (
                                      <Card
                                          key={index}
                                          className="dark:bg-gray-700 dark:border-gray-600"
                                          title={<span className="dark:text-white">{chart.title}</span>}
                                      >
                                          <ResponsiveContainer width="100%" height={chart.type === "pie" ? 400 : 300}>
                                              {chart.type === "bar" ? (
                                                  <BarChart data={getChartData()}>
                                                      <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                                      <XAxis dataKey="date" stroke="#fff" />
                                                      <YAxis stroke="#fff" />
                                                      <Tooltip
                                                          contentStyle={{
                                                              backgroundColor: '#374151',
                                                              borderColor: '#4b5563',
                                                              color: '#fff'
                                                          }}
                                                      />
                                                      <Legend />
                                                      <Bar dataKey="dayDowntimes" name="Дневные простои" fill="#8884d8" />
                                                      <Bar dataKey="nightDowntimes" name="Ночные простои" fill="#82ca9d" />
                                                  </BarChart>
                                              ) : chart.type === "line" ? (
                                                  <LineChart data={getChartData()}>
                                                      <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                                      <XAxis dataKey="date" stroke="#fff" />
                                                      <YAxis stroke="#fff" />
                                                      <Tooltip
                                                          contentStyle={{
                                                              backgroundColor: '#374151',
                                                              borderColor: '#4b5563',
                                                              color: '#fff'
                                                          }}
                                                      />
                                                      <Legend />
                                                      <Line
                                                          type="monotone"
                                                          dataKey="dayProduction"
                                                          name="Дневная смена"
                                                          stroke="#8884d8"
                                                          activeDot={{ r: 8 }}
                                                      />
                                                      <Line
                                                          type="monotone"
                                                          dataKey="nightProduction"
                                                          name="Ночная смена"
                                                          stroke="#82ca9d"
                                                      />
                                                  </LineChart>
                                              ) : (
                                                  <PieChart>
                                                      <Pie
                                                          data={getPieData()}
                                                          cx="50%"
                                                          cy="50%"
                                                          labelLine={false}
                                                          outerRadius={120}
                                                          fill="#8884d8"
                                                          dataKey="value"
                                                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                      >
                                                          {getPieData().map((entry, index) => (
                                                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                          ))}
                                                      </Pie>
                                                      <Tooltip
                                                          contentStyle={{
                                                              backgroundColor: '#374151',
                                                              borderColor: '#4b5563',
                                                              color: '#fff'
                                                          }}
                                                      />
                                                      <Legend />
                                                  </PieChart>
                                              )}
                                          </ResponsiveContainer>
                                      </Card>
                                  ))}
                              </div>
                          </TabPane>
                      </Tabs>
                  </Spin>
              </Card>
          </div>
      </div>
  );
};

export default MonthlyReport;