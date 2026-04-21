import { adminClient } from '@/lib/sanityAdmin'

export default async function TestTokenPage() {
    // Check if token exists
    const token = process.env.SANITY_API_WRITE_TOKEN
    const tokenPreview = token ? `${token.substring(0, 10)}...${token.substring(token.length - 4)}` : 'MISSING'

    return (
        <div className="p-8">
            <h1 className="text-2xl mb-4">Token Test</h1>
            <p>Token found: {token ? 'YES' : 'NO'}</p>
            <p>Token preview: {tokenPreview}</p>
            <p>Token length: {token?.length || 0} characters</p>

            <hr className="my-4" />

            <h2 className="text-xl mb-2">Attempting to create note...</h2>
            <pre className="bg-gray-800 p-4 rounded text-xs overflow-auto">
                {await testCreate()}
            </pre>
        </div>
    )
}

async function testCreate() {
    try {
        const result = await adminClient.create({
            _type: 'gmNote',
            title: 'Test Token - Please Delete',
            content: [{ _type: 'block', children: [{ _type: 'span', text: 'Testing token permissions' }] }]
        })
        return `✅ SUCCESS! Created note with ID: ${result._id}`
    } catch (error: any) {
        return `❌ ERROR: ${error.message}`
    }
}