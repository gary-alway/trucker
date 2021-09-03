import request, { SuperAgentRequest } from 'superagent'
import { API } from '../../src/constants'
import { testParcel } from '../testFactories'

const createTruck = (): SuperAgentRequest =>
  request.post(`${API}/trucks/create`)

describe('API acceptance tests', () => {
  it('POST /trucks/create - creates a new truck', async () => {
    const { status, body } = await createTruck()
    expect(status).toBe(200)
    expect(body).toEqual({
      status: 'ok',
      id: expect.any(String)
    })
  })

  it('GET /trucks/{id} - gets a truck status', async () => {
    const res = await createTruck()
    const id = res.body.id

    const { status, body } = await request.get(`${API}/trucks/${id}`)

    expect(status).toBe(200)
    expect(body).toEqual({
      status: 'ok',
      data: { id, parcels: [], totalWeight: 0 }
    })
  })

  it('GET /trucks/ - gets a list of all trucks', async () => {
    const [res1, res2, res3] = await Promise.all([
      createTruck(),
      createTruck(),
      createTruck()
    ])

    const id1 = res1.body.id
    const id2 = res2.body.id
    const id3 = res3.body.id

    const { status, body } = await request.get(`${API}/trucks`)

    expect(status).toBe(200)
    const ids = body.data.map(({ id }: { id: string }) => id)
    expect(ids.includes(id1)).toBe(true)
    expect(ids.includes(id2)).toBe(true)
    expect(ids.includes(id3)).toBe(true)
  })

  it('POST /trucks/{id}/load - loads a truck', async () => {
    const res1 = await createTruck()
    const id = res1.body.id

    const parcel1 = testParcel()
    const parcel2 = testParcel()
    const parcels = [parcel1, parcel2]

    const res2 = await request
      .post(`${API}/trucks/${id}/load`)
      .send({ parcels })

    const parcel3 = testParcel()
    const parcel4 = testParcel()
    const moreParcels = [parcel3, parcel4]
    await request
      .post(`${API}/trucks/${id}/load`)
      .send({ parcels: moreParcels })

    expect(res2.status).toBe(200)

    const { status, body } = await request.get(`${API}/trucks/${id}`)

    const allParcels = [...parcels, ...moreParcels]

    expect(status).toBe(200)
    expect(body.data.parcels).toEqual(allParcels)
    expect(body.data.totalWeight).toBe(
      allParcels.reduce((acc, curr) => acc + curr.weight, 0)
    )
  })

  it('POST /trucks/{id}/unload - unloads a truck', async () => {
    const res1 = await createTruck()
    const id = res1.body.id

    const parcel1 = testParcel()
    const parcel2 = testParcel()
    const parcel3 = testParcel()
    const parcel4 = testParcel()
    const parcels = [parcel1, parcel2, parcel3, parcel4]

    const res2 = await request
      .post(`${API}/trucks/${id}/load`)
      .send({ parcels })

    expect(res2.status).toBe(200)

    const res3 = await request
      .post(`${API}/trucks/${id}/unload`)
      .send({ parcels: [parcel1.id, parcel3.id] })

    expect(res3.status).toBe(200)
    expect(res3.body.data.parcels).toEqual([parcel1, parcel3])

    const res4 = await request.get(`${API}/trucks/${id}`)

    expect(res4.body.data.parcels).toEqual([parcel2, parcel4])
    expect(res4.body.data.totalWeight).toBe(
      [parcel2, parcel4].reduce((acc, curr) => acc + curr.weight, 0)
    )
  })
})
