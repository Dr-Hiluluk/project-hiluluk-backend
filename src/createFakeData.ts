import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function createFakeData() {
  const now = new Date();
  const posts = [...Array(40).keys()].map((i) => ({
    userId: 2,
    title: `포스트 #${i + 40}`,
    body: "cream twilight eunoia banana apple eunoia heimish shine flutter cherish adorable blossom girlish miracle grapes lucid miracle adorable serendipity ice ideale ice droplet world pure flutter cresent requiem milky marshmallow honey iris laptop heimish world twilight laptop iris shine hello honey laptop cresent destiny pure world banana lovable haze carnival.twilight bijou hello miracle droplet honey milky eunoia grapes destiny flutter serendipity kitten bijou blush ice twinkle bijou charming droplet hello florence eunoia ice flora milky blush vanilla charming world kitten flora eunoia twinkle honey miracle banana haze girlish you like kitten grapes honey adorable blush seraphic honey ideale banana.haze world cream ice ice honey pure iris moonlight sunrise adolescence vanilla blossom stella droplet twilight blossom aurora aurora seraphic banana vanilla way lovable adolescence fascinating blush lucid way cherish flora cherish serendipity shine cresent like cream adolescence blossom milky lucy blossom fascinating way blossom apple milky twilight charming cresent.",
    createdAt: new Date(now.setDate(now.getDate() - 7)),
    updatedAt: new Date(now.setDate(now.getDate() - 7)),
  }));

  const fakeDatas = await prisma.post.createMany({
    data: posts,
  });

  console.log(fakeDatas);
}
