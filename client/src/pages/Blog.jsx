import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ChevronRight, Share2 } from 'lucide-react';

import { blogPosts } from '../services/blogData';

export default function Blog() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const categories = ['All', 'Training', 'Nutrition', 'Lifestyle', 'Wellness'];

    const filteredPosts = selectedCategory === 'All'
        ? blogPosts
        : blogPosts.filter(post => post.category === selectedCategory);

    return (
        <div className="container" style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Fitness Journal</h1>
                <p style={styles.subtitle}>Insights, tips, and stories from our world-class coaches</p>
            </header>

            {/* Filters */}
            <div style={styles.filtersWrapper}>
                <div style={styles.categories}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                ...styles.catBtn,
                                background: selectedCategory === cat ? 'white' : 'transparent',
                                color: selectedCategory === cat ? 'black' : '#a1a1aa',
                                borderColor: selectedCategory === cat ? 'white' : '#333'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div style={styles.searchBox}>
                    <Search size={18} color="#a1a1aa" />
                    <input type="text" placeholder="Search articles..." style={styles.searchInput} />
                </div>
            </div>

            {/* Featured Post */}
            {selectedCategory === 'All' && (
                <Link to={`/blog/${blogPosts[0].id}`} style={styles.featuredCard}>
                    <div style={styles.featuredImageWrapper}>
                        <img src={blogPosts[0].image} alt={blogPosts[0].title} style={styles.featuredImage} />
                    </div>
                    <div style={styles.featuredContent}>
                        <span style={styles.catBadge}>{blogPosts[0].category}</span>
                        <h2 style={styles.featuredTitle}>{blogPosts[0].title}</h2>
                        <p style={styles.featuredExcerpt}>{blogPosts[0].excerpt}</p>
                        <div style={styles.meta}>
                            <span>{blogPosts[0].author}</span>
                            <span style={styles.dot}>•</span>
                            <span>{blogPosts[0].date}</span>
                            <span style={styles.dot}>•</span>
                            <span style={styles.readTime}><Clock size={14} /> {blogPosts[0].readTime}</span>
                        </div>
                    </div>
                </Link>
            )}

            {/* Blog Grid */}
            <div className="grid grid-3" style={styles.grid}>
                {filteredPosts.map((post, idx) => (
                    // Skip the first one if it's the featured one on 'All'
                    (selectedCategory !== 'All' || idx !== 0) && (
                        <Link to={`/blog/${post.id}`} key={post.id} className="card" style={styles.card}>
                            <div style={styles.cardImageWrapper}>
                                <img src={post.image} alt={post.title} style={styles.cardImage} />
                                <span style={styles.cardCatBadge}>{post.category}</span>
                            </div>
                            <div style={styles.cardBody}>
                                <h3 style={styles.cardTitle}>{post.title}</h3>
                                <p style={styles.cardExcerpt}>{post.excerpt.substring(0, 90)}...</p>
                                <div style={styles.cardFooter}>
                                    <span style={styles.cardAuthor}>{post.author}</span>
                                    <div style={styles.cardReadTime}>
                                        <Clock size={12} /> {post.readTime}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                ))}
            </div>

            {/* Newsletter */}
            <section style={styles.newsletter}>
                <h2 style={styles.newsletterTitle}>Stay inspired</h2>
                <p style={styles.newsletterSub}>Get the latest fitness tips and local gym offers delivered to your inbox.</p>
                <div style={styles.newsletterForm}>
                    <input type="email" placeholder="Your email address" style={styles.newsletterInput} />
                    <button className="btn btn-primary" style={styles.newsletterBtn}>Subscribe</button>
                </div>
            </section>
        </div>
    );
}

const styles = {
    container: {
        paddingTop: '4rem',
        paddingBottom: '6rem',
    },
    header: {
        textAlign: 'center',
        marginBottom: '4rem',
    },
    title: {
        fontSize: '3.5rem',
        fontWeight: 800,
        marginBottom: '1rem',
        background: 'linear-gradient(to right, #fff, #a1a1aa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        fontSize: '1.25rem',
        color: '#a1a1aa',
    },
    filtersWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '3rem',
        gap: '2rem',
        flexWrap: 'wrap',
    },
    categories: {
        display: 'flex',
        gap: '0.75rem',
    },
    catBtn: {
        padding: '0.6rem 1.25rem',
        borderRadius: '999px',
        border: '1px solid',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: '#1a1a1a',
        padding: '0.6rem 1.25rem',
        borderRadius: '999px',
        border: '1px solid #333',
        minWidth: '300px',
    },
    searchInput: {
        background: 'transparent',
        border: 'none',
        color: 'white',
        fontSize: '0.9rem',
        outline: 'none',
        width: '100%',
    },
    featuredCard: {
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        background: '#161616',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        border: '1px solid #222',
        marginBottom: '4rem',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform 0.3s ease, border-color 0.3s ease',
    },
    featuredImageWrapper: {
        height: '450px',
    },
    featuredImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    featuredContent: {
        padding: '4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    catBadge: {
        color: '#ef4444',
        fontWeight: 700,
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '1rem',
        display: 'block',
    },
    featuredTitle: {
        fontSize: '2.5rem',
        fontWeight: 800,
        marginBottom: '1.5rem',
        lineHeight: 1.1,
    },
    featuredExcerpt: {
        fontSize: '1.1rem',
        color: '#a1a1aa',
        marginBottom: '2rem',
        lineHeight: 1.6,
    },
    meta: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: '#71717a',
        fontSize: '0.9rem',
    },
    dot: {
        fontSize: '0.5rem',
    },
    readTime: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
    },
    grid: {
        gap: '2rem',
    },
    card: {
        padding: 0,
        background: '#161616',
        border: '1px solid #222',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
    },
    cardImageWrapper: {
        position: 'relative',
        height: '240px',
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.5s ease',
    },
    cardCatBadge: {
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        padding: '0.3rem 0.75rem',
        borderRadius: '0.5rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'white',
        border: '1px solid rgba(255,255,255,0.1)',
    },
    cardBody: {
        padding: '1.5rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    cardTitle: {
        fontSize: '1.25rem',
        fontWeight: 700,
        marginBottom: '0.75rem',
        lineHeight: 1.3,
    },
    cardExcerpt: {
        fontSize: '0.95rem',
        color: '#71717a',
        lineHeight: 1.5,
        marginBottom: '1.5rem',
    },
    cardFooter: {
        marginTop: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #222',
        paddingTop: '1rem',
    },
    cardAuthor: {
        fontSize: '0.85rem',
        color: '#a1a1aa',
        fontWeight: 500,
    },
    cardReadTime: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.8rem',
        color: '#71717a',
    },
    newsletter: {
        marginTop: '8rem',
        background: 'linear-gradient(to right, #111, #1a1a1a)',
        borderRadius: '2rem',
        padding: '4rem',
        textAlign: 'center',
        border: '1px solid #222',
    },
    newsletterTitle: {
        fontSize: '2rem',
        fontWeight: 800,
        marginBottom: '0.5rem',
    },
    newsletterSub: {
        color: '#a1a1aa',
        marginBottom: '2rem',
    },
    newsletterForm: {
        display: 'flex',
        maxWidth: '500px',
        margin: '0 auto',
        gap: '0.75rem',
    },
    newsletterInput: {
        flex: 1,
        background: '#0c0c0c',
        border: '1px solid #333',
        borderRadius: '0.75rem',
        padding: '0.75rem 1.25rem',
        color: 'white',
        outline: 'none',
    },
    newsletterBtn: {
        padding: '0.75rem 1.5rem',
    }
};
