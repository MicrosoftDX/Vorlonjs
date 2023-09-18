declare var AMap: { new(): Map<any,any> };
interface AMap<IndexType, ValueType> {
    get(index:IndexType): ValueType,
    set(index:IndexType, value:ValueType)
}

declare var MappingSystem: MappingSystemConstructor;
interface MappingSystemConstructor {
    new(): MappingSystem<any,any,any,any>
    NodeMappingSystem: NodeMappingSystemConstructor
    Pointer: MappingSystemPointerConstructor
}
interface MappingSystem<IndexType, MetaType, DataType, LiveType> {
    data: DataType[],
    p2oMap: AMap<IndexType,LiveType>,
    o2pMap: AMap<LiveType,MappingSystemPointer<IndexType,MetaType>>
    addToMaps(index: IndexType, meta: MetaType, value: LiveType)
}
interface NodeMappingSystemConstructor {
    new(document?: Document): NodeMappingSystem
    initFromDocument(): NodeMappingSystem
    initFromData(data: DehydratedNode[]): NodeMappingSystem
}
interface DehydratedNode {
    nodeName: string,
    nodeValue: string,
    outerHTML: string
}
interface NodeMappingSystem extends MappingSystem<string,string,DehydratedNode,Node> {
    addNodeAndChildren(node: Node)
    importData(data: DehydratedNode[])
	getPointerListFor(nodes: {length:number,[i:number]:Node}): MappingSystemPointer<string,string>[]
	getPointerFor(node: Node): MappingSystemPointer<string,string>
	getObjectListFor(pointers: MappingSystemPointer<string,string>[]): Node[] 
	getObjectFor(pointer: MappingSystemPointer<string,string>): Node
}
interface MappingSystemPointer<IndexType, MetaType> {
    index: IndexType,
    meta: MetaType
}
interface MappingSystemPointerConstructor {
    new<IndexType, MetaType>(index:IndexType, meta?:MetaType): MappingSystemPointer<IndexType, MetaType>
}
