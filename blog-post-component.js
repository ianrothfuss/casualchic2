// Blog Post Component for Casual Chic Boutique 2.0

// storefront/src/components/BlogPost.jsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '../utils/date';
import ShareButtons from './ShareButtons';

const BlogPost = ({ post, isFull = false }) => {
  // Format publication date
  const formattedDate = formatDate(post.published_at);
  
  // Get reading time (approx 200 words per minute)
  const getReadingTime = (content) => {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(words / 200);
    return readingTime;
  };
  
  // Get excerpt from content (first 150 characters without HTML tags)
  const getExcerpt = (content, length = 150) => {
    const text = content.replace(/<[^>]*>/g, '');
    if (text.length <= length) return text;
    return text.slice(0, length).trim() + '...';
  };
  
  // Get structured data for SEO
  const getStructuredData = () => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': post.title,
      'description': getExcerpt(post.content, 150),
      'image': post.featured_image,
      'author': {
        '@type': 'Person',
        'name': post.author.name
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Casual Chic Boutique',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://casualchicboutique.com/images/logo.svg'
        }
      },
      'datePublished': post.published_at,
      'dateModified': post.updated_at || post.published_at
    };
    
    if (post.categories && post.categories.length > 0) {
      structuredData.keywords = post.categories.map(cat => cat.name).join(', ');
    }
    
    return structuredData;
  };
  
  return (
    <article className={`blog-post ${isFull ? 'blog-post-full' : 'blog-post-card'}`} itemScope itemType="https://schema.org/BlogPosting">
      {/* Add Schema.org structured data */}
      {isFull && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getStructuredData()) }}
        />
      )}
      
      {/* Featured Image */}
      {post.featured_image && (
        <div className={`blog-post-image ${isFull ? 'mb-6 rounded-lg overflow-hidden' : 'mb-4'}`}>
          <Link href={`/blog/${post.slug}`}>
            <a>
              <div className="relative w-full" style={{ height: isFull ? '400px' : '200px' }}>
                <Image
                  src={post.featured_image}
                  alt={post.title}
                  layout="fill"
                  objectFit="cover"
                  itemProp="image"
                />
              </div>
            </a>
          </Link>
        </div>
      )}
      
      {/* Post Meta */}
      <div className="blog-post-meta mb-3 text-sm text-gray-500">
        <span itemProp="datePublished" content={post.published_at}>
          {formattedDate}
        </span>
        
        <span className="mx-2">•</span>
        
        <span>{getReadingTime(post.content)} min read</span>
        
        {post.categories && post.categories.length > 0 && (
          <>
            <span className="mx-2">•</span>
            <span>
              {post.categories.map((category, index) => (
                <span key={category.id}>
                  <Link href={`/blog/category/${category.slug}`}>
                    <a className="hover:text-primary">
                      {category.name}
                    </a>
                  </Link>
                  {index < post.categories.length - 1 && ', '}
                </span>
              ))}
            </span>
          </>
        )}
      </div>
      
      {/* Author (in full mode) */}
      {isFull && post.author && (
        <div className="blog-post-author mb-6 flex items-center">
          <div className="author-avatar mr-3">
            <Image
              src={post.author.avatar || '/images/avatar-placeholder.png'}
              alt={post.author.name}
              width={40}
              height={40}
              className="rounded-full"
              itemProp="author"
            />
          </div>
          
          <div className="author-info">
            <p className="author-name font-medium">{post.author.name}</p>
            {post.author.role && (
              <p className="author-role text-sm text-gray-500">{post.author.role}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Title */}
      <h2 
        className={`blog-post-title ${isFull ? 'text-3xl font-serif mb-6' : 'text-xl mb-3'}`}
        itemProp="headline"
      >
        <Link href={`/blog/${post.slug}`}>
          <a className={isFull ? '' : 'hover:text-primary'}>
            {post.title}
          </a>
        </Link>
      </h2>
      
      {/* Content */}
      {isFull ? (
        <div 
          className="blog-post-content prose max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
          itemProp="articleBody"
        />
      ) : (
        <p className="blog-post-excerpt mb-4" itemProp="description">
          {getExcerpt(post.content)}
        </p>
      )}
      
      {/* Read More Link (in card mode) */}
      {!isFull && (
        <Link href={`/blog/${post.slug}`}>
          <a className="blog-post-read-more text-primary hover:underline">
            Read more →
          </a>
        </Link>
      )}
      
      {/* Share Buttons (in full mode) */}
      {isFull && (
        <div className="blog-post-share mt-8 pt-6 border-t">
          <p className="mb-3 font-medium">Share this article:</p>
          <ShareButtons
            url={`https://casualchicboutique.com/blog/${post.slug}`}
            title={post.title}
            image={post.featured_image}
          />
        </div>
      )}
      
      {/* Tags (in full mode) */}
      {isFull && post.tags && post.tags.length > 0 && (
        <div className="blog-post-tags mt-8">
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <Link key={tag} href={`/blog/tag/${tag}`}>
                <a className="tag-pill">
                  #{tag}
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default BlogPost;
