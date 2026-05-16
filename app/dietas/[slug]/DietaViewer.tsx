'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Recipe {
  id: string;
  name?: string; // Global recipe
  title?: string; // Local recipe
  time?: string;
  image?: string;
  ingredients?: string[];
  recipe?: string[]; // Global recipe instructions
  instructions?: string; // Local recipe instructions html
}

interface DietaViewerProps {
  dieta: any;
  globalRecipes: any[];
}

export default function DietaViewer({ dieta, globalRecipes }: DietaViewerProps) {
  const [activeTab, setActiveTab] = useState<'plan' | 'recetas'>('plan');
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedRecipe && !isClosing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedRecipe, isClosing]);

  const getRecipeDetails = (rId: string): Recipe | null => {
    const globalRec = globalRecipes.find(m => m.id === rId);
    if (globalRec) return globalRec;
    const localRec = dieta.recipes?.find((r: any) => r.id === rId);
    if (localRec) return localRec;
    return null;
  };

  // Collect all unique recipes used in this diet for the "Recetario"
  const allDietRecipeIds = new Set<string>();
  dieta.schedule?.forEach((day: any) => {
    day.meals?.forEach((option: any) => {
      option.recipeIds?.forEach((id: string) => allDietRecipeIds.add(id));
    });
  });

  const allRecipes = Array.from(allDietRecipeIds)
    .map(id => getRecipeDetails(id))
    .filter(Boolean) as Recipe[];

  const handleOpenRecipe = (recipeId: string) => {
    const recipe = getRecipeDetails(recipeId);
    if (recipe) {
      setIsClosing(false);
      setSelectedRecipe(recipe);
    }
  };

  const handleCloseRecipe = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedRecipe(null);
      setIsClosing(false);
    }, 350); // Matches CSS animation duration
  };

  const getImageUrl = (img?: string) => {
    if (!img) return '/assets/images/ui/icono-comida.webp';
    return img.startsWith('http') || img.startsWith('/') ? img : `/${img.replace(/^\.\.\//, '')}`;
  };

  const getMealChipClass = (mealName: string) => {
    const lower = mealName.toLowerCase();
    if (lower.includes('desayuno')) return 'meal-section__chip--desayuno';
    if (lower.includes('almuerzo')) return 'meal-section__chip--almuerzo';
    if (lower.includes('snack') || lower.includes('merienda')) return 'meal-section__chip--snack';
    if (lower.includes('cena')) return 'meal-section__chip--cena';
    return 'meal-section__chip--default';
  };

  const activeDay = dieta.schedule?.[activeDayIndex];

  return (
    <div className="diet-content-wrapper">
      {/* Tabs */}
      <nav className="diet-tabs-wrapper" role="tablist">
        <div className="diet-tabs">
          <button 
            className={`diet-tab ${activeTab === 'plan' ? 'active' : ''}`}
            onClick={() => setActiveTab('plan')}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> 
            Plan
          </button>
          <button 
            className={`diet-tab ${activeTab === 'recetas' ? 'active' : ''}`}
            onClick={() => setActiveTab('recetas')}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> 
            Recetas
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="diet-content">
        
        {/* PANEL: PLAN */}
        {activeTab === 'plan' && (
          <section className="diet-panel active">
            {/* Introduction */}
            {dieta.introduction && (
              <div className="diet-intro-card">
                <div dangerouslySetInnerHTML={{ __html: dieta.introduction }} />
              </div>
            )}

            <div className="plan-layout">
              <div className="plan-layout__schedule">
                <p className="diet-section-title">Programa alimenticio</p>

                {/* Day Pills */}
                <div className="day-pills">
                  {dieta.schedule?.map((day: any, idx: number) => (
                    <button
                      key={idx}
                      className={`day-pill ${activeDayIndex === idx ? 'active' : ''}`}
                      onClick={() => setActiveDayIndex(idx)}
                    >
                      {day.name}
                    </button>
                  ))}
                </div>

                {/* Active Day Content */}
                {activeDay && (
                  <div className="day-panel active" key={activeDayIndex}>
                    {activeDay.meals?.map((mealTime: any, mealIdx: number) => (
                      <div key={mealIdx} className="meal-section">
                        <div className="meal-section__header">
                          <span className={`meal-section__chip ${getMealChipClass(mealTime.type || mealTime.name || 'Opción')}`}>
                            {mealTime.type || mealTime.name || `Comida ${mealIdx + 1}`}
                          </span>
                          <div className="meal-section__line"></div>
                        </div>

                        <div className="meal-section__cards">
                          {mealTime.description && (
                            <div className="meal-option-sep">{mealTime.description}</div>
                          )}
                          
                          {mealTime.recipeIds?.map((rId: string) => {
                            const recipe = getRecipeDetails(rId);
                            if (!recipe) return <div key={rId} className="meal-option-sep">Receta no encontrada</div>;
                            const title = recipe.name || recipe.title || 'Receta';
                            const imgUrl = getImageUrl(recipe.image);

                            return (
                              <div key={rId} className="meal-item meal-item--recipe" onClick={() => handleOpenRecipe(rId)}>
                                <div className="meal-item__icon">
                                  <img src={imgUrl} alt={title} className="meal-item__photo" />
                                </div>
                                <div className="meal-item__body">
                                  <h4 className="meal-item__title">{title}</h4>
                                  {recipe.time && (
                                    <div className="meal-item__time">
                                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                      <span>{recipe.time}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="meal-item__arrow">
                                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* PANEL: RECIPES */}
        {activeTab === 'recetas' && (
          <section className="diet-panel active">
            <div className="recipes-panel-header">
              <p className="diet-section-title" style={{ paddingTop: '24px', marginBottom: '16px' }}>Todas las recetas</p>

              {/* Adaptaciones/Variaciones (Replaces the old filter visually) */}
              {dieta.variations && dieta.variations.length > 0 && (
                <details className="diet-filter">
                  <summary className="diet-filter__toggle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                    <span>Adaptar plan</span>
                    <svg className="diet-filter__chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </summary>
                  <div className="diet-filter__menu">
                    {dieta.variations.map((v: any, i: number) => (
                      <div key={i} className="diet-variation-item">
                        <strong>{v.type}:</strong> {v.description}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>

            <div className="recipes-grid">
              {allRecipes.map(recipe => {
                const title = recipe.name || recipe.title || 'Receta';
                const imgUrl = getImageUrl(recipe.image);

                return (
                  <div key={recipe.id} className="recipe-grid-card" onClick={() => handleOpenRecipe(recipe.id)}>
                    <div className="recipe-grid-card__img-container">
                      <img src={imgUrl} alt={title} className="recipe-grid-card__img" />
                    </div>
                    <div className="recipe-grid-card__body">
                      <h4 className="recipe-grid-card__title">{title}</h4>
                      {recipe.time && (
                        <div className="recipe-grid-card__time">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          <span>{recipe.time}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>

      {/* RECIPE MODAL DRAWER */}
      {selectedRecipe && (
        <div className={`diet-modal-backdrop ${isClosing ? 'closing' : 'active'}`} onClick={(e) => {
          if (e.target === e.currentTarget) handleCloseRecipe();
        }}>
          <div className={`diet-modal-wrapper ${isClosing ? 'closing' : 'active'}`}>
            <div className="diet-modal">
              <button className="diet-modal__close" onClick={handleCloseRecipe}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              <div className="diet-modal__img-wrap">
                <img 
                  className="diet-modal__img" 
                  src={getImageUrl(selectedRecipe.image)} 
                  alt={selectedRecipe.name || selectedRecipe.title} 
                />
              </div>
              
              <div className="diet-modal__body">
                <div className="diet-modal__header">
                  <h2 className="diet-modal__title">{selectedRecipe.name || selectedRecipe.title}</h2>
                </div>
                
                {selectedRecipe.time && (
                  <div className="diet-modal__time">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>{selectedRecipe.time}</span>
                  </div>
                )}
                
                <p className="diet-modal__ingredients-title">Ingredientes</p>
                <ul className="diet-modal__ingredients">
                  {selectedRecipe.ingredients?.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
                
                <p className="diet-modal__instructions-title">Preparación</p>
                <div className="diet-modal__instructions">
                  {selectedRecipe.recipe ? (
                    <ol>
                      {selectedRecipe.recipe.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  ) : selectedRecipe.instructions ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }} />
                  ) : (
                    <p>Instrucciones no disponibles.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
