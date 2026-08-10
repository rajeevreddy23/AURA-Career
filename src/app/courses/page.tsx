'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MOCK_COURSES, COURSE_CATEGORIES, LEVELS } from '@/lib/constants';
import { formatDuration, formatNumber, cn } from '@/lib/utils';
import { Search, Star, Clock, Users, ArrowRight, SlidersHorizontal, Grid3X3, List, Sparkles } from 'lucide-react';

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');

  const filteredCourses = MOCK_COURSES.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    const matchesLevel = !selectedLevel || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="primary" size="md" className="mb-4">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                {MOCK_COURSES.length} Courses Available
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Explore Our{' '}
                <span className="text-gradient">Courses</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Find the perfect course for your learning journey
              </p>

              {/* Search */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search courses, topics, or instructors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl border border-border bg-card text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors border',
                  !selectedCategory
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                )}
              >
                All
              </button>
              {COURSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors border',
                    selectedCategory === cat.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Level Filter */}
              <select
                value={selectedLevel || ''}
                onChange={(e) => setSelectedLevel(e.target.value || null)}
                className="h-10 px-3 rounded-xl border border-border bg-background text-sm"
              >
                <option value="">All Levels</option>
                {LEVELS.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 px-3 rounded-xl border border-border bg-background text-sm"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center border border-border rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn('h-10 w-10 flex items-center justify-center rounded-xl transition-colors',
                    viewMode === 'grid' ? 'bg-accent text-foreground' : 'text-muted-foreground'
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('h-10 w-10 flex items-center justify-center rounded-xl transition-colors',
                    viewMode === 'list' ? 'bg-accent text-foreground' : 'text-muted-foreground'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">No courses found matching your criteria</p>
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid'
                ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            )}>
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/courses/${course.id}`}>
                    <Card hover className={cn('h-full overflow-hidden', viewMode === 'list' && 'flex')}>
                      <div className={cn(
                        'aspect-video relative overflow-hidden group',
                        viewMode === 'list' && 'w-48 shrink-0 aspect-auto'
                      )}
                      style={{ backgroundColor: `${course.color}15` }}>
                        <div 
                          className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: `linear-gradient(135deg, ${course.color}40, ${course.color}00)`,
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div 
                            initial={{ y: 0 }}
                            animate={{ y: [-5, 5, -5] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="text-5xl group-hover:scale-125 transition-transform duration-500 drop-shadow-md"
                          >
                            {course.emoji}
                          </motion.div>
                        </div>
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent pointer-events-none" />
                        <div className="absolute top-3 left-3 flex gap-2 z-10">
                          <Badge variant="default" size="sm" className="bg-background/80 backdrop-blur-sm border-none shadow-sm">{course.category.split('-')[0]}</Badge>
                          <Badge variant="default" size="sm" className="bg-background/80 backdrop-blur-sm border-none shadow-sm">{course.level}</Badge>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col">
                        <CardContent className="flex-1 space-y-3">
                          <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                              {course.instructor.name[0]}
                            </div>
                            <span className="text-xs text-muted-foreground">{course.instructor.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                              {course.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDuration(course.totalDuration)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {formatNumber(course.enrolledStudents)}
                            </span>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-border pt-4">
                          <div className="flex items-center justify-between w-full">
                            <span className={course.price === 0 ? 'text-green-500 font-semibold text-sm' : 'font-semibold text-sm'}>
                              {course.price === 0 ? 'Free' : `$${course.price}`}
                            </span>
                            <span className="text-xs text-primary flex items-center gap-1">
                              Enroll Now <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </CardFooter>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
