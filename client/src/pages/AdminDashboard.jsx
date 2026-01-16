import { useState, useEffect } from 'react';
import { BarChart3, Users, Building2, Calendar, DollarSign, Settings, Bell, Search, Filter, MoreVertical, X, Check, Lock, Unlock, TrendingUp, Clock, Send, Globe, Layout, FileText, Megaphone } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import api from '../services/api';

export default function AdminDashboard() {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [gyms, setGyms] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [financials, setFinancials] = useState(null);
    const [systemSettings, setSystemSettings] = useState(null);
    const [banners, setBanners] = useState([]);
    const [staticPages, setStaticPages] = useState([]);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const headers = { Authorization: `Bearer ${token}` };

            if (activeTab === 'overview') {
                const res = await api.get('/super-admin/stats', { headers });
                setStats(res.data);
            } else if (activeTab === 'users') {
                const res = await api.get('/super-admin/users', { headers });
                setUsers(res.data.users);
            } else if (activeTab === 'gyms') {
                const res = await api.get('/super-admin/gyms', { headers });
                setGyms(res.data.gyms);
            } else if (activeTab === 'trainers') {
                const res = await api.get('/super-admin/trainers', { headers });
                setTrainers(res.data.trainers);
            } else if (activeTab === 'bookings') {
                const res = await api.get('/super-admin/bookings', { headers });
                setBookings(res.data.bookings);
            } else if (activeTab === 'financials') {
                const [finRes, txRes, payRes] = await Promise.all([
                    api.get('/super-admin/financials', { headers }),
                    api.get('/super-admin/transactions', { headers }),
                    api.get('/super-admin/payouts', { headers })
                ]);
                setFinancials({
                    stats: finRes.data,
                    transactions: txRes.data.transactions,
                    payouts: payRes.data.payouts
                });
            } else if (activeTab === 'settings') {
                const res = await api.get('/super-admin/settings', { headers });
                setSystemSettings(res.data.settings);
            } else if (activeTab === 'banners') {
                const res = await api.get('/super-admin/banners', { headers });
                setBanners(res.data.banners);
            } else if (activeTab === 'static-pages') {
                const res = await api.get('/super-admin/static-pages', { headers });
                setStaticPages(res.data.pages);
            } else if (activeTab === 'ads') {
                const res = await api.get('/super-admin/ads/performance', { headers });
                setAds(res.data.ads);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserAction = async (userId, isActive) => {
        if (!confirm(`Are you sure you want to ${isActive ? 'block' : 'unblock'} this user?`)) return;
        try {
            const token = await getToken();
            await api.put(`/super-admin/users/${userId}/status`, { isActive: !isActive }, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    };

    const handleGymAction = async (gymId, approved) => {
        if (!confirm(`Are you sure you want to ${approved ? 'approve' : 'reject'} this gym?`)) return;
        try {
            const token = await getToken();
            await api.put(`/super-admin/gyms/${gymId}/status`, { isApproved: approved }, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch (error) {
            console.error('Error updating gym status:', error);
        }
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={activeTab === id ? styles.tabActive : styles.tab}
        >
            <Icon size={18} /> {label}
        </button>
    );

    return (
        <div style={styles.container}>
            <div style={styles.sidebar}>
                <div style={styles.logo}>
                    <span style={{ color: '#8B5CF6' }}>Super</span>Admin
                </div>
                <div style={styles.tabList}>
                    <TabButton id="overview" label="Overview" icon={BarChart3} />
                    <TabButton id="users" label="Users" icon={Users} />
                    <TabButton id="gyms" label="Gyms" icon={Building2} />
                    <TabButton id="trainers" label="Trainers" icon={Users} />
                    <TabButton id="bookings" label="Bookings" icon={Calendar} />
                    <TabButton id="financials" label="Financials" icon={DollarSign} />
                    <TabButton id="notifications" label="Broadcast" icon={Megaphone} />
                    <TabButton id="banners" label="Banners" icon={Layout} />
                    <TabButton id="static-pages" label="Static Pages" icon={FileText} />
                    <TabButton id="ads" label="Ads" icon={TrendingUp} />
                    <TabButton id="settings" label="Settings" icon={Settings} />
                </div>
                <div style={styles.userSection}>
                    <img src={user?.imageUrl} alt="Profile" style={styles.profileImg} />
                    <div>
                        <div style={styles.userName}>{user?.fullName}</div>
                        <div style={styles.userRole}>Super Admin</div>
                    </div>
                </div>
            </div>

            <div style={styles.mainContent}>
                <div style={styles.header}>
                    <h1 style={styles.pageTitle}>
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h1>
                    <button style={styles.iconBtn}><Bell size={20} /></button>
                </div>

                {loading ? (
                    <div style={styles.loading}><div className="spinner" /></div>
                ) : (
                    <>
                        {activeTab === 'overview' && stats && (
                            <div className="grid grid-4">
                                <StatCard label="Total Users" value={stats.totalUsers} icon={<Users size={24} color="#3B82F6" />} />
                                <StatCard label="Total Gyms" value={stats.totalGyms} icon={<Building2 size={24} color="#8B5CF6" />} />
                                <StatCard label="Total Bookings" value={stats.totalBookings} icon={<Calendar size={24} color="#10B981" />} />
                                <StatCard label="Revenue" value={`₹${stats.totalRevenue}`} icon={<DollarSign size={24} color="#F59E0B" />} />
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div style={styles.card}>
                                <div style={styles.tableHeader}>
                                    <div style={styles.searchBox}>
                                        <Search size={18} color="#666" />
                                        <input placeholder="Search users..." style={styles.searchInput} />
                                    </div>
                                </div>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Name</th>
                                            <th style={styles.th}>Email</th>
                                            <th style={styles.th}>Role</th>
                                            <th style={styles.th}>Status</th>
                                            <th style={styles.th}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td style={styles.td}>{user.name}</td>
                                                <td style={styles.td}>{user.email}</td>
                                                <td style={styles.td}>
                                                    <span style={{ ...styles.badge, background: '#333', color: '#bbb' }}>{user.role}</span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        ...styles.badge,
                                                        background: user.is_active ? '#064e3b' : '#7f1d1d',
                                                        color: user.is_active ? '#6ee7b7' : '#fca5a5'
                                                    }}>
                                                        {user.is_active ? 'Active' : 'Blocked'}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <button
                                                        onClick={() => handleUserAction(user.id, user.is_active)}
                                                        style={styles.actionBtn}
                                                    >
                                                        {user.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'gyms' && (
                            <div style={styles.card}>
                                <div style={styles.tableHeader}>
                                    <h3 style={styles.subTitle}>Gym Approvals</h3>
                                </div>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Gym Name</th>
                                            <th style={styles.th}>Owner</th>
                                            <th style={styles.th}>Location</th>
                                            <th style={styles.th}>Status</th>
                                            <th style={styles.th}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gyms.filter(g => !g.is_approved).map(gym => (
                                            <tr key={gym.id}>
                                                <td style={styles.td}>{gym.name}</td>
                                                <td style={styles.td}>
                                                    <div>{gym.owner_name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{gym.owner_email}</div>
                                                </td>
                                                <td style={styles.td}>{gym.city}</td>
                                                <td style={styles.td}><span style={{ ...styles.badge, background: '#713f12', color: '#fde047' }}>Pending</span></td>
                                                <td style={styles.td}>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => handleGymAction(gym.id, true)} style={{ ...styles.btn, background: '#166534' }}><Check size={16} /></button>
                                                        <button onClick={() => handleGymAction(gym.id, false)} style={{ ...styles.btn, background: '#991b1b' }}><X size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <h3 style={{ ...styles.subTitle, marginTop: '2rem' }}>All Gyms</h3>
                            </div>
                        )}

                        {activeTab === 'bookings' && (
                            <div style={styles.card}>
                                <div style={styles.tableHeader}>
                                    <h3 style={styles.subTitle}>Recent Bookings</h3>
                                </div>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>User</th>
                                            <th style={styles.th}>Gym/Service</th>
                                            <th style={styles.th}>Date/Time</th>
                                            <th style={styles.th}>Status</th>
                                            <th style={styles.th}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map(booking => (
                                            <tr key={booking.id}>
                                                <td style={styles.td}>{booking.user_name}</td>
                                                <td style={styles.td}>
                                                    <div>{booking.gym_name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{booking.service_name}</div>
                                                </td>
                                                <td style={styles.td}>
                                                    <div>{new Date(booking.booking_date).toLocaleDateString()}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{booking.start_time}</div>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        ...styles.badge,
                                                        background: booking.status === 'confirmed' ? '#064e3b' : booking.status === 'cancelled' ? '#7f1d1d' : '#27272a',
                                                        color: booking.status === 'confirmed' ? '#6ee7b7' : booking.status === 'cancelled' ? '#fca5a5' : '#a1a1aa'
                                                    }}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    {booking.status === 'confirmed' && (
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm('Cancel this booking?')) return;
                                                                const token = await getToken();
                                                                await api.put(`/super-admin/bookings/${booking.id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
                                                                fetchData();
                                                            }}
                                                            style={{ ...styles.actionBtn, color: '#ef4444' }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div style={styles.card}>
                                <h3 style={styles.subTitle}>Broadcast Notification</h3>
                                <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.target);
                                        const data = Object.fromEntries(formData);
                                        try {
                                            const token = await getToken();
                                            await api.post('/super-admin/notifications/broadcast', data, { headers: { Authorization: `Bearer ${token}` } });
                                            alert('Broadcasted!');
                                            e.target.reset();
                                        } catch (err) { alert('Failed'); }
                                    }}
                                >
                                    <input name="title" placeholder="Notification Title" style={styles.input} required />
                                    <textarea name="message" placeholder="Message content..." style={{ ...styles.input, height: '100px' }} required />
                                    <select name="type" style={styles.input}>
                                        <option value="system">System Alert</option>
                                        <option value="promotion">Promotion</option>
                                    </select>
                                    <button type="submit" style={{ ...styles.btn, width: 'auto', padding: '0 2rem', background: '#8B5CF6' }}>
                                        <Send size={18} style={{ marginRight: '0.5rem' }} /> Broadcast Now
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'banners' && (
                            <div style={styles.card}>
                                <h3 style={styles.subTitle}>Home Banners</h3>
                                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '1rem 0' }}>
                                    {banners.map(banner => (
                                        <div key={banner.id} style={{ minWidth: '200px', background: '#27272a', borderRadius: '0.5rem', overflow: 'hidden' }}>
                                            <img src={banner.image_url} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                                            <div style={{ padding: '0.5rem' }}>
                                                <div style={{ fontWeight: 600 }}>{banner.title}</div>
                                                <button onClick={async () => {
                                                    if (!confirm('Delete?')) return;
                                                    const token = await getToken();
                                                    await api.post('/super-admin/banners', { action: 'delete', bannerId: banner.id }, { headers: { Authorization: `Bearer ${token}` } });
                                                    fetchData();
                                                }} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <h4 style={{ marginTop: '2rem' }}>Add New Banner</h4>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    const bannerData = Object.fromEntries(formData);
                                    try {
                                        const token = await getToken();
                                        await api.post('/super-admin/banners', { action: 'create', bannerData }, { headers: { Authorization: `Bearer ${token}` } });
                                        fetchData();
                                        e.target.reset();
                                    } catch (err) { alert('Failed'); }
                                }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                    <input name="image_url" placeholder="Image URL" style={styles.input} required />
                                    <input name="title" placeholder="Title" style={styles.input} />
                                    <input name="subtitle" placeholder="Subtitle" style={styles.input} />
                                    <input name="link_url" placeholder="Link URL" style={styles.input} />
                                    <button type="submit" style={{ gridColumn: 'span 2', ...styles.btn, width: 'auto', background: '#10B981' }}>Add Banner</button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'ads' && (
                            <div style={styles.card}>
                                <h3 style={styles.subTitle}>Ads & Promotions</h3>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Gym</th>
                                            <th style={styles.th}>Type</th>
                                            <th style={styles.th}>Views/Clicks</th>
                                            <th style={styles.th}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ads.map(ad => (
                                            <tr key={ad.id}>
                                                <td style={styles.td}>{ad.gym_name}</td>
                                                <td style={styles.td}>{ad.type}</td>
                                                <td style={styles.td}>{ad.views_count} / {ad.clicks_count}</td>
                                                <td style={styles.td}>{ad.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <h4 style={{ marginTop: '2rem' }}>Create New Ad</h4>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    const adData = Object.fromEntries(formData);
                                    try {
                                        const token = await getToken();
                                        await api.post('/super-admin/ads', adData, { headers: { Authorization: `Bearer ${token}` } });
                                        fetchData();
                                        e.target.reset();
                                        alert('Ad created!');
                                    } catch (err) { alert('Failed to create ad'); }
                                }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                    <input name="gym_id" placeholder="Gym UUID" style={styles.input} required />
                                    <select name="type" style={styles.input} required>
                                        <option value="sponsored">Sponsored</option>
                                        <option value="homepage_banner">Homepage Banner</option>
                                        <option value="location_promo">Location Promo</option>
                                    </select>
                                    <input name="pricing" type="number" placeholder="Pricing (₹)" style={styles.input} required />
                                    <input name="start_date" type="date" style={styles.input} required />
                                    <input name="end_date" type="date" style={styles.input} required />
                                    <button type="submit" style={{ gridColumn: 'span 2', ...styles.btn, width: 'auto', background: '#8B5CF6' }}>Create Ad</button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'static-pages' && (
                            <div style={styles.card}>
                                <h3 style={styles.subTitle}>Manage Static Pages</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                    {staticPages.map(page => (
                                        <details key={page.slug} style={{ background: '#27272a', padding: '1rem', borderRadius: '0.5rem' }}>
                                            <summary style={{ fontWeight: 600, cursor: 'pointer' }}>{page.title} ({page.slug})</summary>
                                            <form onSubmit={async (e) => {
                                                e.preventDefault();
                                                const content = e.target.content.value;
                                                const token = await getToken();
                                                await api.put(`/super-admin/static-pages/${page.slug}`, { title: page.title, content }, { headers: { Authorization: `Bearer ${token}` } });
                                                alert('Updated!');
                                            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                                <textarea name="content" defaultValue={page.content} style={{ ...styles.input, height: '200px' }} />
                                                <button type="submit" style={{ ...styles.btn, width: 'auto', background: '#3B82F6' }}>Save Changes</button>
                                            </form>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && systemSettings && (
                            <div style={styles.card}>
                                <h3 style={styles.subTitle}>Platform Settings</h3>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    const settings = Object.fromEntries(formData);
                                    const token = await getToken();
                                    await api.put('/super-admin/settings', settings, { headers: { Authorization: `Bearer ${token}` } });
                                    alert('Settings Updated');
                                }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                                    <div style={styles.inputGroup}>
                                        <label>Platform Commission (%)</label>
                                        <input name="platform_commission" defaultValue={systemSettings.platform_commission} style={styles.input} />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label>Support Email</label>
                                        <input name="contact_email" defaultValue={systemSettings.contact_email} style={styles.input} />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label>Support Phone</label>
                                        <input name="contact_phone" defaultValue={systemSettings.contact_phone} style={styles.input} />
                                    </div>
                                    <button type="submit" style={{ ...styles.btn, width: 'auto', background: '#8B5CF6' }}>Update Settings</button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'financials' && financials && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div className="grid grid-4">
                                    <StatCard label="Total Revenue" value={`₹${financials.stats.totalRevenue}`} icon={<DollarSign size={24} color="#10B981" />} />
                                    <StatCard label="Platform Commission" value={`₹${financials.stats.platformCommission}`} icon={<TrendingUp size={24} color="#3B82F6" />} />
                                    <StatCard label="Gym Earnings" value={`₹${financials.stats.gymEarnings}`} icon={<Building2 size={24} color="#F59E0B" />} />
                                    <StatCard label="Pending Payouts" value={`₹${financials.stats.pendingPayouts}`} icon={<Clock size={24} color="#EC4899" />} />
                                </div>

                                <div style={styles.card}>
                                    <div style={styles.tableHeader}>
                                        <h3 style={styles.subTitle}>Payout Requests</h3>
                                    </div>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>Recipient</th>
                                                <th style={styles.th}>Amount</th>
                                                <th style={styles.th}>Date</th>
                                                <th style={styles.th}>Status</th>
                                                <th style={styles.th}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {financials.payouts.length > 0 ? financials.payouts.map(payout => (
                                                <tr key={payout.id}>
                                                    <td style={styles.td}>{payout.gym_name || payout.trainer_name}</td>
                                                    <td style={styles.td}>₹{payout.amount}</td>
                                                    <td style={styles.td}>{new Date(payout.created_at).toLocaleDateString()}</td>
                                                    <td style={styles.td}>
                                                        <span style={{
                                                            ...styles.badge,
                                                            background: payout.status === 'processed' ? '#064e3b' : payout.status === 'rejected' ? '#7f1d1d' : '#713f12',
                                                            color: payout.status === 'processed' ? '#6ee7b7' : payout.status === 'rejected' ? '#fca5a5' : '#fde047'
                                                        }}>
                                                            {payout.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td style={styles.td}>
                                                        {payout.status === 'pending' && (
                                                            <button
                                                                className="btn-primary"
                                                                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                                onClick={async () => {
                                                                    const txId = prompt('Enter Bank Transaction ID:');
                                                                    if (!txId) return;
                                                                    try {
                                                                        const token = await getToken();
                                                                        await api.put(`/super-admin/payouts/${payout.id}`, { status: 'processed', transactionId: txId }, { headers: { Authorization: `Bearer ${token}` } });
                                                                        fetchData();
                                                                    } catch (e) { console.error(e); alert('Failed'); }
                                                                }}
                                                            >
                                                                Process
                                                            </button>
                                                        )}
                                                        {payout.status === 'processed' && <span style={{ fontSize: '0.8rem', color: '#666' }}>{payout.transaction_id}</span>}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="5" style={{ ...styles.td, textAlign: 'center', color: '#666' }}>No payout requests</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div style={styles.card}>
                                    <div style={styles.tableHeader}>
                                        <h3 style={styles.subTitle}>Recent Transactions</h3>
                                    </div>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>Date</th>
                                                <th style={styles.th}>Type</th>
                                                <th style={styles.th}>Amount</th>
                                                <th style={styles.th}>User</th>
                                                <th style={styles.th}>Payment ID</th>
                                                <th style={styles.th}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {financials.transactions.map(tx => (
                                                <tr key={tx.id}>
                                                    <td style={styles.td}>{new Date(tx.created_at).toLocaleDateString()}</td>
                                                    <td style={styles.td}>{tx.transaction_type}</td>
                                                    <td style={styles.td}>₹{tx.amount}</td>
                                                    <td style={styles.td}>{tx.user_name}</td>
                                                    <td style={styles.td}><span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{tx.payment_id}</span></td>
                                                    <td style={styles.td}>
                                                        <span style={{ ...styles.badge, background: '#064e3b', color: '#6ee7b7' }}>
                                                            {tx.payment_status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

const StatCard = ({ label, value, icon }) => (
    <div style={styles.statCard}>
        <div style={styles.statIconWrapper}>{icon}</div>
        <div>
            <div style={styles.statLabel}>{label}</div>
            <div style={styles.statValue}>{value}</div>
        </div>
    </div>
);

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        background: '#09090b',
        color: 'white',
        fontFamily: "'Inter', sans-serif",
    },
    sidebar: {
        width: '260px',
        background: '#111',
        borderRight: '1px solid #222',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '3rem',
        paddingLeft: '1rem',
    },
    tabList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flex: 1,
    },
    tab: {
        background: 'transparent',
        border: 'none',
        color: '#a1a1aa',
        padding: '0.75rem 1rem',
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderRadius: '0.5rem',
        transition: 'all 0.2s',
    },
    tabActive: {
        background: '#27272a',
        color: 'white',
        padding: '0.75rem 1rem',
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderRadius: '0.5rem',
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        borderTop: '1px solid #222',
        marginTop: 'auto',
    },
    profileImg: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        objectFit: 'cover',
    },
    userName: {
        fontSize: '0.9rem',
        fontWeight: 600,
    },
    userRole: {
        fontSize: '0.75rem',
        color: '#a1a1aa',
    },
    mainContent: {
        flex: 1,
        padding: '2rem',
        overflowY: 'auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    pageTitle: {
        fontSize: '1.8rem',
        fontWeight: 700,
    },
    iconBtn: {
        background: '#18181b',
        border: '1px solid #333',
        color: 'white',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '4rem',
    },
    statCard: {
        background: '#18181b',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        border: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    statIconWrapper: {
        width: '48px',
        height: '48px',
        borderRadius: '0.5rem',
        background: '#27272a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        color: '#a1a1aa',
        fontSize: '0.875rem',
        marginBottom: '0.25rem',
    },
    statValue: {
        fontSize: '1.5rem',
        fontWeight: 700,
    },
    card: {
        background: '#18181b',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        border: '1px solid #27272a',
    },
    tableHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: '#27272a',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        border: '1px solid #333',
        width: '300px',
    },
    searchInput: {
        background: 'transparent',
        border: 'none',
        color: 'white',
        outline: 'none',
        width: '100%',
    },
    input: {
        background: '#111',
        border: '1px solid #333',
        borderRadius: '0.5rem',
        padding: '0.75rem 1rem',
        color: 'white',
        fontSize: '0.9rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        textAlign: 'left',
        padding: '1rem',
        borderBottom: '1px solid #333',
        color: '#a1a1aa',
        fontSize: '0.875rem',
        fontWeight: 600,
    },
    td: {
        padding: '1rem',
        borderBottom: '1px solid #222',
        fontSize: '0.9rem',
    },
    badge: {
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
        fontSize: '0.75rem',
        fontWeight: 600,
    },
    actionBtn: {
        background: 'transparent',
        border: 'none',
        color: '#a1a1aa',
        cursor: 'pointer',
        padding: '0.25rem',
        ':hover': { color: 'white' }
    },
    btn: {
        border: 'none',
        color: 'white',
        minWidth: '32px',
        height: '32px',
        borderRadius: '0.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    subTitle: {
        fontSize: '1.1rem',
        marginTop: '0',
    }
};
