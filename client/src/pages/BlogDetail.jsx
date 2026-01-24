import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, User, Calendar, Share2, ArrowLeft, ChevronRight } from 'lucide-react';
import { blogPosts } from '../services/blogData';

export default function BlogDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);

    useEffect(() => {
        const foundPost = blogPosts.find(p => p.id === parseInt(id));
        setPost(foundPost);

        if (foundPost) {
            setRelatedPosts(blogPosts.filter(p => p.category === foundPost.category && p.id !== foundPost.id).slice(0, 3));
        }
        window.scrollTo(0, 0);
    }, [id]);

    if (!post) return <div style={styles.loading}><div className="spinner" /></div>;

    return (
        <div className="container" style={styles.container}>
            <Link to="/blog" style={styles.backBtn}>
                <ArrowLeft size={18} /> Back to Journal
            </Link>

            <article style={styles.article}>
                <header style={styles.header}>
                    <span style={styles.category}>{post.category}</span>
                    <h1 style={styles.title}>{post.title}</h1>

                    <div style={styles.meta}>
                        <div style={styles.metaItem}>
                            <User size={16} />
                            <span>{post.author}</span>
                        </div>
                        <div style={styles.metaItem}>
                            <Calendar size={16} />
                            <span>{post.date}</span>
                        </div>
                        <div style={styles.metaItem}>
                            <Clock size={16} />
                            <span>{post.readTime} read</span>
                        </div>
                    </div>
                </header>

                <div style={styles.imageWrapper}>
                    <img src={post.image} alt={post.title} style={styles.image} />
                </div>

                <div className="filter-sidebar-glass" style={styles.contentWrapper}>
                    <div
                        style={styles.content}
                        dangerouslySetInnerHTML={{ __html: post.content || post.excerpt }}
                    />

                    <div style={styles.footer}>
                        <div style={styles.share}>
                            <span>Share this article:</span>
                            <div style={styles.shareBtns}>
                                <button style={styles.shareBtn}><Share2 size={18} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {relatedPosts.length > 0 && (
                <section style={styles.related}>
                    <h2 style={styles.relatedTitle}>Related Articles</h2>
                    <div className="grid grid-3">
                        {relatedPosts.map(rp => (
                            <Link to={`/blog/${rp.id}`} key={rp.id} className="card" style={styles.rpCard}>
                                <img src={rp.image} alt={rp.title} style={styles.rpImage} />
                                <div style={styles.rpBody}>
                                    <h3 style={styles.rpTitle}>{rp.title}</h3>
                                    <div style={styles.rpMeta}>
                                        <Clock size={12} /> {rp.readTime}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

const styles = {
    container: {
        paddingTop: '6rem',
        paddingBottom: '8rem',
        maxWidth: '900px',
    },
    backBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#a1a1aa',
        textDecoration: 'none',
        marginBottom: '2rem',
        fontSize: '0.9rem',
        transition: 'color 0.2s',
    },
    article: {
        marginBottom: '6rem',
    },
    header: {
        textAlign: 'center',
        marginBottom: '3rem',
    },
    category: {
        color: '#8B5CF6',
        fontWeight: 700,
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginBottom: '1rem',
        display: 'block',
    },
    title: {
        fontSize: '3.5rem',
        fontWeight: 800,
        marginBottom: '2rem',
        lineHeight: 1.1,
    },
    meta: {
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        color: '#71717a',
        fontSize: '0.95rem',
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    imageWrapper: {
        width: '100%',
        height: '500px',
        borderRadius: '2rem',
        overflow: 'hidden',
        marginBottom: '-4rem',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    contentWrapper: {
        padding: '6rem 4rem 4rem',
        borderRadius: '2rem',
        background: 'rgba(22, 22, 22, 0.8)',
        border: '1px solid rgba(255,255,255,0.05)',
    },
    content: {
        fontSize: '1.15rem',
        lineHeight: 1.8,
        color: '#d4d4d8',
        marginBottom: '4rem',
    },
    footer: {
        borderTop: '1px solid #222',
        paddingTop: '2rem',
        display: 'flex',
        justifyContent: 'center',
    },
    share: {
        textAlign: 'center',
        color: '#71717a',
        fontSize: '0.9rem',
    },
    shareBtns: {
        marginTop: '1rem',
        display: 'flex',
        gap: '1rem',
    },
    shareBtn: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: '#1a1a1a',
        border: '1px solid #333',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    related: {
        marginTop: '6rem',
    },
    relatedTitle: {
        fontSize: '2rem',
        fontWeight: 800,
        marginBottom: '3rem',
    },
    rpCard: {
        background: '#161616',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        border: '1px solid #222',
        textDecoration: 'none',
        color: 'inherit',
    },
    rpImage: {
        width: '100%',
        height: '180px',
        objectFit: 'cover',
    },
    rpBody: {
        padding: '1.25rem',
    },
    rpTitle: {
        fontSize: '1.1rem',
        fontWeight: 700,
        marginBottom: '0.75rem',
        lineHeight: 1.3,
    },
    rpMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.8rem',
        color: '#71717a',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
    }
};
