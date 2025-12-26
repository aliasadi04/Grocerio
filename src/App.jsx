import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { Plus, Check, Trash2, ShoppingCart, ShoppingBag, CheckCircle } from 'lucide-react'

// GroceryItem Component
function GroceryItem({ item, onToggle, onDelete }) {
  return (
    <div className={`grocery-item ${item.checked ? 'grocery-item--checked' : ''}`}>
      <div 
        className="grocery-item__checkbox"
        onClick={() => onToggle(item.id, !item.checked)}
        role="checkbox"
        aria-checked={item.checked}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggle(item.id, !item.checked)}
      >
        <Check size={16} className="grocery-item__checkbox-icon" />
      </div>
      <div className="grocery-item__content">
        <div className="grocery-item__name">{item.name}</div>
        <div className="grocery-item__quantity">Qty: {item.quantity}</div>
      </div>
      <button 
        className="grocery-item__delete"
        onClick={() => onDelete(item.id)}
        aria-label={`Delete ${item.name}`}
      >
        <Trash2 size={18} />
      </button>
    </div>
  )
}

// ConfirmModal Component
function ConfirmModal({ items, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Ready to checkout?</h2>
          <p className="modal__subtitle">Review your checked items before removing them</p>
        </div>
        <div className="modal__content">
          {items.map((item) => (
            <div key={item.id} className="modal__item">
              <CheckCircle size={20} className="modal__item-icon" />
              <span className="modal__item-name">{item.name}</span>
              <span className="modal__item-quantity">×{item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="modal__actions">
          <button className="modal__button modal__button--cancel" onClick={onCancel}>
            Go Back
          </button>
          <button className="modal__button modal__button--confirm" onClick={onConfirm}>
            Confirm Purchase
          </button>
        </div>
      </div>
    </div>
  )
}

// Toast Component
function Toast({ message }) {
  return <div className="toast">{message}</div>
}

// Main App Component
export default function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('1')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [toast, setToast] = useState(null)

  // Show toast notification
  const showToast = useCallback((message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }, [])

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

    // Subscribe to real-time changes
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
  }, [fetchItems])

  // Add new item
  const handleAddItem = async (e) => {
    e.preventDefault()
    
    const name = newItemName.trim()
    if (!name) return

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

      setNewItemName('')
      setNewItemQuantity('1')
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
    try {
      const { error } = await supabase
        .from('grocery_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      showToast('Item removed')
    } catch (error) {
      console.error('Error deleting item:', error)
      showToast('Failed to delete item')
    }
  }

  // Buy (remove) all checked items
  const handleBuyItems = async () => {
    const checkedItems = items.filter((item) => item.checked)
    const checkedIds = checkedItems.map((item) => item.id)

    try {
      const { error } = await supabase
        .from('grocery_items')
        .delete()
        .in('id', checkedIds)

      if (error) throw error

      setShowConfirmModal(false)
      showToast(`Purchased ${checkedItems.length} item${checkedItems.length !== 1 ? 's' : ''}!`)
    } catch (error) {
      console.error('Error removing items:', error)
      showToast('Failed to remove items')
    }
  }

  const checkedItems = items.filter((item) => item.checked)
  const checkedCount = checkedItems.length

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

      {/* Add Item Form */}
      <form className="add-form" onSubmit={handleAddItem}>
        <div className="add-form__row">
          <input
            type="text"
            className="add-form__input"
            placeholder="Add an item..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            aria-label="Item name"
          />
          <input
            type="text"
            className="add-form__input add-form__input--quantity"
            placeholder="Qty"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(e.target.value)}
            aria-label="Quantity"
          />
          <button 
            type="submit" 
            className="add-form__button"
            disabled={!newItemName.trim()}
          >
            <Plus size={20} />
          </button>
        </div>
      </form>

      {/* Grocery List */}
      <div className="grocery-list">
        {items.length === 0 ? (
          <div className="grocery-list__empty">
            <div className="grocery-list__empty-icon">🛒</div>
            <p className="grocery-list__empty-text">
              Your list is empty.<br />Add some items to get started!
            </p>
          </div>
        ) : (
          items.map((item) => (
            <GroceryItem
              key={item.id}
              item={item}
              onToggle={handleToggleItem}
              onDelete={handleDeleteItem}
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
          <ShoppingBag size={22} />
          Buy Checked Items
          {checkedCount > 0 && (
            <span className="buy-button__count">{checkedCount}</span>
          )}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ConfirmModal
          items={checkedItems}
          onConfirm={handleBuyItems}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {/* Toast Notification */}
      {toast && <Toast message={toast} />}
    </div>
  )
}
