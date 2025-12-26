import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './lib/supabase'
import { Plus, Check, Trash2, ShoppingBag, CheckCircle, Undo2, Zap } from 'lucide-react'

// Emoji mapping for common items
const ITEM_EMOJIS = {
  'milk': '🥛',
  'bread': '🍞',
  'eggs': '🥚',
  'egg': '🥚',
  'butter': '🧈',
  'cheese': '🧀',
  'chicken': '🍗',
  'rice': '🍚',
  'apple': '🍎',
  'apples': '🍎',
  'banana': '🍌',
  'bananas': '🍌',
  'tomato': '🍅',
  'tomatoes': '🍅',
  'potato': '🥔',
  'potatoes': '🥔',
  'carrot': '🥕',
  'carrots': '🥕',
  'onion': '🧅',
  'onions': '🧅',
  'garlic': '🧄',
  'meat': '🥩',
  'beef': '🥩',
  'fish': '🐟',
  'shrimp': '🦐',
  'orange': '🍊',
  'oranges': '🍊',
  'lemon': '🍋',
  'lemons': '🍋',
  'strawberry': '🍓',
  'strawberries': '🍓',
  'grape': '🍇',
  'grapes': '🍇',
  'watermelon': '🍉',
  'peach': '🍑',
  'pear': '🍐',
  'coffee': '☕',
  'tea': '🍵',
  'water': '💧',
  'juice': '🧃',
  'soda': '🥤',
  'beer': '🍺',
  'wine': '🍷',
  'pizza': '🍕',
  'pasta': '🍝',
  'noodles': '🍜',
  'salad': '🥗',
  'sandwich': '🥪',
  'taco': '🌮',
  'burrito': '🌯',
  'cookie': '🍪',
  'cookies': '🍪',
  'cake': '🎂',
  'chocolate': '🍫',
  'candy': '🍬',
  'ice cream': '🍦',
  'yogurt': '🥛',
  'cereal': '🥣',
  'soup': '🍲',
  'pepper': '🌶️',
  'corn': '🌽',
  'broccoli': '🥦',
  'cucumber': '🥒',
  'avocado': '🥑',
  'eggplant': '🍆',
  'mushroom': '🍄',
  'mushrooms': '🍄',
  'peanut': '🥜',
  'peanuts': '🥜',
  'honey': '🍯',
  'salt': '🧂',
  'oil': '🫒',
  'default': '🛒'
}

// Get emoji for item name
function getEmoji(name) {
  const lower = name.toLowerCase().trim()
  return ITEM_EMOJIS[lower] || ITEM_EMOJIS['default']
}

// GroceryItem Component
function GroceryItem({ item, onToggle, onDeleteClick }) {
  const handleItemClick = (e) => {
    if (e.target.closest('.grocery-item__delete')) return
    onToggle(item.id, !item.checked)
  }

  return (
    <div 
      className={`grocery-item ${item.checked ? 'grocery-item--checked' : ''}`}
      onClick={handleItemClick}
      role="checkbox"
      aria-checked={item.checked}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onToggle(item.id, !item.checked)}
    >
      <div className="grocery-item__checkbox">
        <Check size={20} className="grocery-item__checkbox-icon" />
      </div>
      <div className="grocery-item__content">
        <div className="grocery-item__name">{item.name}</div>
        <div className="grocery-item__quantity">Qty: {item.quantity}</div>
      </div>
      <button 
        className="grocery-item__delete"
        onClick={(e) => {
          e.stopPropagation()
          onDeleteClick(item)
        }}
        aria-label={`Delete ${item.name}`}
      >
        <Trash2 size={22} />
      </button>
    </div>
  )
}

// ConfirmModal Component
function ConfirmModal({ items, onConfirm, onCancel, mode = 'buy' }) {
  const isSingleDelete = mode === 'delete'
  
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">
            {isSingleDelete ? 'Remove item?' : 'Ready to checkout?'}
          </h2>
          <p className="modal__subtitle">
            {isSingleDelete 
              ? 'This item will be removed from your list'
              : 'Review your checked items before removing them'
            }
          </p>
        </div>
        <div className="modal__content">
          {items.map((item) => (
            <div key={item.id} className="modal__item">
              <CheckCircle size={24} className="modal__item-icon" />
              <span className="modal__item-name">{item.name}</span>
              <span className="modal__item-quantity">×{item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="modal__actions">
          <button className="modal__button modal__button--cancel" onClick={onCancel}>
            Go Back
          </button>
          <button 
            className={`modal__button ${isSingleDelete ? 'modal__button--delete' : 'modal__button--confirm'}`} 
            onClick={onConfirm}
          >
            {isSingleDelete ? 'Remove Item' : 'Confirm Purchase'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Toast Component with optional undo action
function Toast({ message, onUndo, showUndo }) {
  return (
    <div className="toast">
      <span>{message}</span>
      {showUndo && onUndo && (
        <button className="toast__undo" onClick={onUndo}>
          <Undo2 size={18} />
          Undo
        </button>
      )}
    </div>
  )
}

// Quick Add Button Component
function QuickAddButton({ item, onAdd, disabled }) {
  return (
    <button 
      className="quick-add__button"
      onClick={() => onAdd(item.name)}
      aria-label={`Add ${item.name}`}
      disabled={disabled}
    >
      <span className="quick-add__emoji">{item.emoji}</span>
      <span className="quick-add__name">{item.name}</span>
    </button>
  )
}

// Main App Component
export default function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('1')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [toast, setToast] = useState(null)
  const [deletedItems, setDeletedItems] = useState([])
  const [quickAddItems, setQuickAddItems] = useState([])
  const toastTimeoutRef = useRef(null)

  // Show toast notification
  const showToast = useCallback((message, canUndo = false) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    setToast({ message, canUndo })
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null)
      if (!canUndo) {
        setDeletedItems([])
      }
    }, canUndo ? 5000 : 3000)
  }, [])

  // Fetch quick-add suggestions from Supabase
  const fetchQuickAddItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('item_counts')
        .select('name, count')
        .order('count', { ascending: false })
        .limit(3)

      if (error) throw error
      
      if (data && data.length > 0) {
        setQuickAddItems(data.map(item => ({
          name: item.name,
          emoji: getEmoji(item.name)
        })))
      }
    } catch (error) {
      console.log('Quick add not available yet:', error.message)
      // Table might not exist yet, that's okay
    }
  }, [])

  // Increment item count in Supabase
  const incrementItemCount = useCallback(async (name) => {
    const normalizedName = name.trim()
    try {
      // Try to get existing item
      const { data: existing } = await supabase
        .from('item_counts')
        .select('id, count')
        .eq('name', normalizedName)
        .single()

      if (existing) {
        // Update count
        await supabase
          .from('item_counts')
          .update({ count: existing.count + 1, last_used: new Date().toISOString() })
          .eq('id', existing.id)
      } else {
        // Insert new
        await supabase
          .from('item_counts')
          .insert([{ name: normalizedName, count: 1 }])
      }
      
      // Refresh quick add items
      fetchQuickAddItems()
    } catch (error) {
      console.log('Could not update item counts:', error.message)
    }
  }, [fetchQuickAddItems])

  // Fetch items from Supabase
  const fetchItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('grocery_items')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching items:', error)
      showToast('Failed to load items')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Set up real-time subscription
  useEffect(() => {
    fetchItems()
    fetchQuickAddItems()

    const channel = supabase
      .channel('grocery_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grocery_items'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setItems((prev) => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setItems((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? payload.new : item
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) =>
              prev.filter((item) => item.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchItems, fetchQuickAddItems])

  // Add new item
  const handleAddItem = async (e) => {
    e?.preventDefault()
    
    const name = newItemName.trim()
    if (name.length < 3) {
      showToast('Item name must be at least 3 characters')
      return
    }

    try {
      const { error } = await supabase
        .from('grocery_items')
        .insert([
          {
            name,
            quantity: newItemQuantity || '1',
            checked: false
          }
        ])

      if (error) throw error

      // Increment the count for this item
      incrementItemCount(name)

      setNewItemName('')
      setNewItemQuantity('1')
      showToast(`Added ${name}`)
    } catch (error) {
      console.error('Error adding item:', error)
      showToast('Failed to add item')
    }
  }

  // Quick add item
  const handleQuickAdd = async (name) => {
    try {
      const { error } = await supabase
        .from('grocery_items')
        .insert([
          {
            name,
            quantity: '1',
            checked: false
          }
        ])

      if (error) throw error

      incrementItemCount(name)
      showToast(`Added ${name}`)
    } catch (error) {
      console.error('Error adding item:', error)
      showToast('Failed to add item')
    }
  }

  // Toggle item checked status
  const handleToggleItem = async (id, checked) => {
    try {
      const { error } = await supabase
        .from('grocery_items')
        .update({ checked, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating item:', error)
      showToast('Failed to update item')
    }
  }

  // Delete single item
  const handleDeleteItem = async (id) => {
    const itemToRemove = items.find(item => item.id === id)
    
    try {
      const { error } = await supabase
        .from('grocery_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Store for undo
      setDeletedItems([itemToRemove])
      showToast('Item removed', true)
    } catch (error) {
      console.error('Error deleting item:', error)
      showToast('Failed to delete item')
    }
  }

  // Undo delete
  const handleUndo = async () => {
    if (deletedItems.length === 0) return

    try {
      const itemsToRestore = deletedItems.map(({ id, ...rest }) => rest)
      
      const { error } = await supabase
        .from('grocery_items')
        .insert(itemsToRestore)

      if (error) throw error

      setDeletedItems([])
      setToast(null)
      showToast(`Restored ${deletedItems.length} item${deletedItems.length > 1 ? 's' : ''}`)
    } catch (error) {
      console.error('Error restoring items:', error)
      showToast('Failed to restore items')
    }
  }

  // Buy (remove) all checked items
  const handleBuyItems = async () => {
    const checkedItemsList = items.filter((item) => item.checked)
    const checkedIds = checkedItemsList.map((item) => item.id)

    try {
      const { error } = await supabase
        .from('grocery_items')
        .delete()
        .in('id', checkedIds)

      if (error) throw error

      // Store for undo
      setDeletedItems(checkedItemsList)
      setShowConfirmModal(false)
      showToast(`Purchased ${checkedItemsList.length} item${checkedItemsList.length !== 1 ? 's' : ''}!`, true)
    } catch (error) {
      console.error('Error removing items:', error)
      showToast('Failed to remove items')
    }
  }

  // Sort items: unchecked first, then checked
  const sortedItems = [...items].sort((a, b) => {
    if (a.checked === b.checked) return 0
    return a.checked ? 1 : -1
  })

  const checkedItems = items.filter((item) => item.checked)
  const checkedCount = checkedItems.length
  const isValidName = newItemName.trim().length >= 3

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading__spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <img 
          src="/grocery.svg" 
          alt="Grocery bag" 
          className="header__icon" 
        />
        <h1 className="header__title">Family Groceries</h1>
        <p className="header__subtitle">Shop together, eat together</p>
      </header>

      {/* Quick Add Section */}
      {quickAddItems.length > 0 && (
        <div className="quick-add">
          <div className="quick-add__header">
            <Zap size={18} />
            <span>Quick Add</span>
          </div>
          <div className="quick-add__buttons">
            {quickAddItems.map((item) => (
              <QuickAddButton 
                key={item.name} 
                item={item} 
                onAdd={handleQuickAdd}
                disabled={items.some(i => i.name.toLowerCase() === item.name.toLowerCase() && !i.checked)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Item Form */}
      <form className="add-form" onSubmit={handleAddItem}>
        <input
          type="text"
          className="add-form__input add-form__input--name"
          placeholder="Add an item... (min 3 letters)"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          aria-label="Item name"
        />
        <div className="add-form__row">
          <input
            type="text"
            className="add-form__input add-form__input--quantity"
            placeholder="Qty"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(e.target.value)}
            onFocus={(e) => e.target.select()}
            aria-label="Quantity"
          />
          <button 
            type="submit" 
            className="add-form__button"
            disabled={!isValidName}
          >
            <Plus size={22} />
            <span>Add Item</span>
          </button>
        </div>
      </form>

      {/* Grocery List */}
      <div className="grocery-list">
        {sortedItems.length === 0 ? (
          <div className="grocery-list__empty">
            <div className="grocery-list__empty-icon">🛒</div>
            <p className="grocery-list__empty-text">
              Your list is empty.<br />Add some items to get started!
            </p>
          </div>
        ) : (
          sortedItems.map((item) => (
            <GroceryItem
              key={item.id}
              item={item}
              onToggle={handleToggleItem}
              onDeleteClick={(item) => setItemToDelete(item)}
            />
          ))
        )}
      </div>

      {/* Buy Button */}
      <div className="buy-button-container">
        <button
          className="buy-button"
          onClick={() => setShowConfirmModal(true)}
          disabled={checkedCount === 0}
        >
          <ShoppingBag size={24} />
          Buy Checked Items
          {checkedCount > 0 && (
            <span className="buy-button__count">{checkedCount}</span>
          )}
        </button>
      </div>

      {/* Confirmation Modal - Buy Items */}
      {showConfirmModal && (
        <ConfirmModal
          items={checkedItems}
          onConfirm={handleBuyItems}
          onCancel={() => setShowConfirmModal(false)}
          mode="buy"
        />
      )}

      {/* Confirmation Modal - Delete Single Item */}
      {itemToDelete && (
        <ConfirmModal
          items={[itemToDelete]}
          onConfirm={() => {
            handleDeleteItem(itemToDelete.id)
            setItemToDelete(null)
          }}
          onCancel={() => setItemToDelete(null)}
          mode="delete"
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          showUndo={toast.canUndo}
          onUndo={handleUndo}
        />
      )}
    </div>
  )
}
