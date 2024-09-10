'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { GitBranch, BarChart2, Network } from 'lucide-react'

interface TreeNode {
  value: number
  left: TreeNode | null
  right: TreeNode | null
}

function buildTree(values: number[]): TreeNode | null {
  if (values.length === 0) return null
  const root: TreeNode = { value: values[0], left: null, right: null }
  const queue: TreeNode[] = [root]
  let i = 1

  while (queue.length > 0 && i < values.length) {
    const current = queue.shift()!
    if (i < values.length && values[i] !== null) {
      current.left = { value: values[i], left: null, right: null }
      queue.push(current.left)
    }
    i++
    if (i < values.length && values[i] !== null) {
      current.right = { value: values[i], left: null, right: null }
      queue.push(current.right)
    }
    i++
  }

  return root
}

function getMaxDepth(node: TreeNode | null): number {
  if (!node) return 0
  return 1 + Math.max(getMaxDepth(node.left), getMaxDepth(node.right))
}

function isBalanced(node: TreeNode | null): boolean {
  if (!node) return true
  const leftDepth = getMaxDepth(node.left)
  const rightDepth = getMaxDepth(node.right)
  return Math.abs(leftDepth - rightDepth) <= 1 && isBalanced(node.left) && isBalanced(node.right)
}

function getTreeDepth(node: TreeNode | null): number {
  if (!node) return 0
  return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right))
}

function* inOrderTraversal(node: TreeNode | null): Generator<TreeNode> {
  if (node) {
    yield* inOrderTraversal(node.left)
    yield node
    yield* inOrderTraversal(node.right)
  }
}

function* preOrderTraversal(node: TreeNode | null): Generator<TreeNode> {
  if (node) {
    yield node
    yield* preOrderTraversal(node.left)
    yield* preOrderTraversal(node.right)
  }
}

function* postOrderTraversal(node: TreeNode | null): Generator<TreeNode> {
  if (node) {
    yield* postOrderTraversal(node.left)
    yield* postOrderTraversal(node.right)
    yield node
  }
}

function* levelOrderTraversal(root: TreeNode | null): Generator<TreeNode> {
  if (!root) return
  const queue: TreeNode[] = [root]
  while (queue.length > 0) {
    const node = queue.shift()!
    yield node
    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
  }
}

function TreeNode({ node, x, y, level, maxDepth, highlightedNode }: { node: TreeNode, x: number, y: number, level: number, maxDepth: number, highlightedNode: TreeNode | null }) {
  const radius = 20
  const verticalSpacing = 60
  const horizontalSpacing = 600 / Math.pow(2, level)
  const isHighlighted = highlightedNode === node

  return (
    <g>
      <motion.circle
        cx={x}
        cy={y}
        r={radius}
        fill={isHighlighted ? "#3b82f6" : "white"}
        stroke={isHighlighted ? "#1d4ed8" : "#4b5563"}
        strokeWidth={2}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      <motion.text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={isHighlighted ? "white" : "black"}
        fontSize="12px"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {node.value}
      </motion.text>
      {node.left && (
        <>
          <motion.line
            x1={x}
            y1={y + radius}
            x2={x - horizontalSpacing / 2}
            y2={y + verticalSpacing - radius}
            stroke="#4b5563"
            strokeWidth={1}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
          <TreeNode
            node={node.left}
            x={x - horizontalSpacing / 2}
            y={y + verticalSpacing}
            level={level + 1}
            maxDepth={maxDepth}
            highlightedNode={highlightedNode}
          />
        </>
      )}
      {node.right && (
        <>
          <motion.line
            x1={x}
            y1={y + radius}
            x2={x + horizontalSpacing / 2}
            y2={y + verticalSpacing - radius}
            stroke="#4b5563"
            strokeWidth={1}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
          <TreeNode
            node={node.right}
            x={x + horizontalSpacing / 2}
            y={y + verticalSpacing}
            level={level + 1}
            maxDepth={maxDepth}
            highlightedNode={highlightedNode}
          />
        </>
      )}
    </g>
  )
}

export function EnhancedBinaryTreeVisualizer() {
  const [input, setInput] = useState('')
  const [tree, setTree] = useState<TreeNode | null>(null)
  const [traversalType, setTraversalType] = useState<string | null>(null)
  const [traversalResult, setTraversalResult] = useState<TreeNode[]>([])
  const [currentStep, setCurrentStep] = useState<number>(-1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [treeDepth, setTreeDepth] = useState(0)
  const [maxDepth, setMaxDepth] = useState(0)
  const [isTreeBalanced, setIsTreeBalanced] = useState(false)

  const handleVisualize = () => {
    const values = input.split(',').map(v => v.trim() === '' || v.trim().toLowerCase() === 'null' ? null : parseInt(v.trim(), 10))
    const newTree = buildTree(values.filter((v): v is number => v !== null))
    setTree(newTree)
    setTreeDepth(getTreeDepth(newTree))
    setMaxDepth(getMaxDepth(newTree))
    setIsTreeBalanced(isBalanced(newTree))
    setTraversalType(null)
    setTraversalResult([])
    setCurrentStep(-1)
  }

  const handleTraversal = (type: string) => {
    if (!tree) return

    let traversalGenerator: Generator<TreeNode>
    switch (type) {
      case 'In-order':
        traversalGenerator = inOrderTraversal(tree)
        break
      case 'Pre-order':
        traversalGenerator = preOrderTraversal(tree)
        break
      case 'Post-order':
        traversalGenerator = postOrderTraversal(tree)
        break
      case 'Level-order':
        traversalGenerator = levelOrderTraversal(tree)
        break
      default:
        return
    }

    const result = Array.from(traversalGenerator)
    setTraversalType(type)
    setTraversalResult(result)
    setCurrentStep(-1)
    setIsAnimating(true)
  }

  useEffect(() => {
    if (isAnimating && currentStep < traversalResult.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (currentStep === traversalResult.length - 1) {
      setIsAnimating(false)
    }
  }, [isAnimating, currentStep, traversalResult.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex flex-col">
      <Card className="w-full max-w-6xl mx-auto bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center">
            <Network className="mr-2" /> Enhanced Binary Tree Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <Label htmlFor="treeInput" className="text-lg font-semibold text-gray-700">Enter tree values (comma-separated):</Label>
            <div className="flex mt-2">
              <Input
                id="treeInput"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., 1,2,3,null,4,5"
                className="flex-grow mr-2 border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <Button onClick={handleVisualize} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 transform hover:scale-105">
                Visualize
              </Button>
            </div>
          </div>
          {tree && (
            <div className="space-y-6">
              <div className="border-2 border-blue-200 rounded-lg p-4 overflow-auto bg-white shadow-inner" style={{height: '400px'}}>
                <svg width="100%" height="100%" viewBox={`0 0 600 ${treeDepth * 80}`}>
                  <TreeNode 
                    node={tree} 
                    x={300} 
                    y={40} 
                    level={0} 
                    maxDepth={treeDepth} 
                    highlightedNode={currentStep >= 0 ? traversalResult[currentStep] : null} 
                  />
                </svg>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white rounded-lg p-4 shadow-md">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-lg font-semibold text-blue-600 flex items-center">
                      <GitBranch className="mr-2" /> Tree Properties
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-gray-700"><span className="font-semibold">Maximum Depth:</span> {maxDepth}</p>
                    <p className="text-gray-700"><span className="font-semibold">Is Balanced:</span> {isTreeBalanced ? 'Yes' : 'No'}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white rounded-lg p-4 shadow-md">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-lg font-semibold text-blue-600 flex items-center">
                      <BarChart2 className="mr-2" /> Traversals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Tabs defaultValue="In-order" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 mb-2">
                        {['In-order', 'Pre-order', 'Post-order', 'Level-order'].map((type) => (
                          <TabsTrigger 
                            key={type} 
                            value={type}
                            onClick={() => handleTraversal(type)}
                            disabled={isAnimating}
                            className="text-xs"
                          >
                            {type}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {['In-order', 'Pre-order', 'Post-order', 'Level-order'].map((type) => (
                        <TabsContent key={type} value={type}>
                          <AnimatePresence>
                            {traversalType === type && (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex flex-wrap gap-2"
                              >
                                {traversalResult.map((node, index) => (
                                  <motion.span
                                    key={index}
                                    className={`inline-block px-3 py-1 rounded-full ${
                                      index <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                                    }`}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                  >
                                    {node.value}
                                  </motion.span>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}